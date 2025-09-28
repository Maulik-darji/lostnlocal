<?php
/**
 * Signup Endpoint
 * Handles user registration
 */

// Include required files
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../config/password.php';

// Set JSON header and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $adminCode = trim($input['adminCode'] ?? '');
    
    // Validate input
    if (empty($name) || empty($email) || empty($password)) {
        throw new Exception('Name, email, and password are required');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }
    
    if (strlen($name) < 2) {
        throw new Exception('Name must be at least 2 characters long');
    }
    
    // Check password strength
    $passwordCheck = PasswordUtils::checkStrength($password);
    if (!$passwordCheck['isValid']) {
        throw new Exception('Password does not meet requirements');
    }
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();
    
    if ($check_stmt->fetch()) {
        throw new Exception('Email already registered');
    }
    
    // Determine if user should be admin
    $isAdmin = false;
    if (!empty($adminCode) && $adminCode === ADMIN_CODE) {
        $isAdmin = true;
    }
    
    // Generate unique user ID
    $uid = 'user_' . time() . '_' . substr(md5($email), 0, 8);
    
    // Hash password
    $passwordHash = PasswordUtils::hash($password);
    
    // Insert new user
    $insert_query = "INSERT INTO users (uid, email, password_hash, display_name, is_admin) 
                     VALUES (:uid, :email, :password_hash, :display_name, :is_admin)";
    $insert_stmt = $db->prepare($insert_query);
    $insert_stmt->bindParam(':uid', $uid);
    $insert_stmt->bindParam(':email', $email);
    $insert_stmt->bindParam(':password_hash', $passwordHash);
    $insert_stmt->bindParam(':display_name', $name);
    $insert_stmt->bindParam(':is_admin', $isAdmin, PDO::PARAM_BOOL);
    
    if (!$insert_stmt->execute()) {
        throw new Exception('Failed to create user account');
    }
    
    $userId = $db->lastInsertId();
    
    // Generate JWT token
    $token_payload = [
        'user_id' => $userId,
        'uid' => $uid,
        'email' => $email,
        'is_admin' => $isAdmin
    ];
    
    $token = JWT::generate($token_payload);
    
    // Store session in database
    $session_query = "INSERT INTO user_sessions (user_id, token_hash, expires_at) 
                      VALUES (:user_id, :token_hash, :expires_at)";
    $session_stmt = $db->prepare($session_query);
    $session_stmt->bindParam(':user_id', $userId);
    $session_stmt->bindParam(':token_hash', hash('sha256', $token));
    $session_stmt->bindParam(':expires_at', date('Y-m-d H:i:s', time() + JWT_EXPIRES_IN));
    $session_stmt->execute();
    
    // Log successful registration
    $log_query = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                  VALUES (:user_id, 'signup_success', 'User registered successfully', :ip_address, :user_agent)";
    $log_stmt = $db->prepare($log_query);
    $log_stmt->bindParam(':user_id', $userId);
    $log_stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR']);
    $log_stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT']);
    $log_stmt->execute();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'data' => [
            'user' => [
                'uid' => $uid,
                'email' => $email,
                'displayName' => $name,
                'isAdmin' => $isAdmin
            ],
            'token' => $token
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>