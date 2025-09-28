<?php
require_once dirname(__DIR__, 2) . '/config/config.php';

// Handle login requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

$clientIP = getClientIP();

// Rate limiting
$rateLimiter = new RateLimiter();
if (!$rateLimiter->checkRateLimit($clientIP, 5, 900)) {
    Response::error('Too many login attempts. Please try again later.', 429);
}

$rateLimiter->recordAttempt($clientIP);

// Get input data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$requiredFields = ['email', 'password'];
$errors = Validator::validateRequired($requiredFields, $input);

if (!empty($errors)) {
    Response::error('Validation failed', 400, $errors);
}

$email = Validator::sanitizeInput($input['email']);
$password = $input['password'];

// Validate input
if (!Validator::validateEmail($email)) {
    Response::error('Invalid email format', 400);
}

// Find user
$db = new Database();
$user = $db->fetchOne(
    "SELECT id, uid, name, email, password, is_admin, is_active FROM users WHERE email = ?",
    [$email]
);

if (!$user) {
    logActivity("Failed login attempt: $email (user not found)");
    Response::error('Invalid email or password', 401);
}

// Check if user is active
if (!$user['is_active']) {
    logActivity("Failed login attempt: $email (account deactivated)");
    Response::error('Account is deactivated', 401);
}

// Verify password
$auth = new Auth();
if (!$auth->verifyPassword($password, $user['password'])) {
    logActivity("Failed login attempt: $email (invalid password)");
    Response::error('Invalid email or password', 401);
}

try {
    // Generate JWT token
    $token = $auth->generateToken($user['id'], $user['email'], $user['is_admin']);
    
    // Store session
    $auth->storeSession($user['id'], $token);
    
    // Update last login
    $db->execute(
        "UPDATE users SET last_login = NOW() WHERE id = ?",
        [$user['id']]
    );
    
    logActivity("User logged in successfully: $email");
    
    Response::success([
        'user' => [
            'id' => $user['id'],
            'uid' => $user['uid'],
            'name' => $user['name'],
            'email' => $user['email'],
            'isAdmin' => $user['is_admin']
        ],
        'token' => $token
    ], 'Login successful');
    
} catch (Exception $e) {
    logActivity("Login error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error during login', 500);
}
?>
