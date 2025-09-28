<?php
require_once dirname(__DIR__, 2) . '/config/config.php';

// Handle signup requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

$clientIP = getClientIP();

// Rate limiting (more lenient for development)
$rateLimiter = new RateLimiter();
if (!$rateLimiter->checkRateLimit($clientIP, 20, 300)) { // 20 attempts per 5 minutes
    Response::error('Too many signup attempts. Please try again later.', 429);
}

$rateLimiter->recordAttempt($clientIP);

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['name', 'email', 'password'];
$errors = Validator::validateRequired($requiredFields, $input);

if (!empty($errors)) {
    Response::error('Validation failed', 400, $errors);
}

$name = Validator::sanitizeInput($input['name']);
$email = Validator::sanitizeInput($input['email']);
$password = $input['password'];
$adminCode = isset($input['adminCode']) ? Validator::sanitizeInput($input['adminCode']) : '';

// Validate input
if (!Validator::validateName($name)) {
    Response::error('Name must be between 2 and 255 characters', 400);
}

if (!Validator::validateEmail($email)) {
    Response::error('Invalid email format', 400);
}

if (!Validator::validatePassword($password)) {
    Response::error('Password must be at least 6 characters long', 400);
}

// Check if user already exists
$db = new Database();
$existingUser = $db->fetchOne(
    "SELECT id FROM users WHERE email = ?",
    [$email]
);

if ($existingUser) {
    Response::error('User with this email already exists', 409);
}

// Check admin code
$isAdmin = false;
if ($adminCode === ADMIN_CODE) {
    $isAdmin = true;
}

// Hash password
$auth = new Auth();
$hashedPassword = $auth->hashPassword($password);

// Generate unique UID
$uid = 'user_' . time() . '_' . bin2hex(random_bytes(4));

try {
    // Insert user
    $db->execute(
        "INSERT INTO users (uid, name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)",
        [$uid, $name, $email, $hashedPassword, $isAdmin]
    );
    
    $userId = $db->lastInsertId();
    
    // Generate JWT token
    $token = $auth->generateToken($userId, $email, $isAdmin);
    
    // Store session
    $auth->storeSession($userId, $token);
    
    // Update last login
    $db->execute(
        "UPDATE users SET last_login = NOW() WHERE id = ?",
        [$userId]
    );
    
    logActivity("User registered successfully: $email");
    
    Response::success([
        'user' => [
            'id' => $userId,
            'uid' => $uid,
            'name' => $name,
            'email' => $email,
            'isAdmin' => $isAdmin
        ],
        'token' => $token
    ], 'User created successfully', 201);
    
} catch (Exception $e) {
    logActivity("Signup error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error during signup', 500);
}
?>
