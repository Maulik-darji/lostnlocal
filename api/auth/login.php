<?php
/**
 * Login Endpoint
 * Handles user authentication
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
    
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    // Validate input
    if (empty($email) || empty($password)) {
        throw new Exception('Email and password are required');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get user by email
    $query = "SELECT id, uid, email, password_hash, display_name, is_admin, is_active, last_login 
              FROM users 
              WHERE email = :email AND is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('Invalid email or password');
    }
    
    // Verify password
    if (!PasswordUtils::verify($password, $user['password_hash'])) {
        // Log failed login attempt
        $log_query = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                      VALUES (:user_id, 'login_failed', 'Invalid password', :ip_address, :user_agent)";
        $log_stmt = $db->prepare($log_query);
        $log_stmt->bindParam(':user_id', $user['id']);
        $log_stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR']);
        $log_stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT']);
        $log_stmt->execute();
        
        throw new Exception('Invalid email or password');
    }
    
    // Update last login
    $update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':id', $user['id']);
    $update_stmt->execute();
    
    // Generate JWT token
    $token_payload = [
        'user_id' => $user['id'],
        'uid' => $user['uid'],
        'email' => $user['email'],
        'is_admin' => (bool)$user['is_admin']
    ];
    
    $token = JWT::generate($token_payload);
    
    // Store session in database
    $session_query = "INSERT INTO user_sessions (user_id, token_hash, expires_at) 
                      VALUES (:user_id, :token_hash, :expires_at)";
    $session_stmt = $db->prepare($session_query);
    $session_stmt->bindParam(':user_id', $user['id']);
    $session_stmt->bindParam(':token_hash', hash('sha256', $token));
    $session_stmt->bindParam(':expires_at', date('Y-m-d H:i:s', time() + JWT_EXPIRES_IN));
    $session_stmt->execute();
    
    // Log successful login
    $log_query = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                  VALUES (:user_id, 'login_success', 'User logged in successfully', :ip_address, :user_agent)";
    $log_stmt = $db->prepare($log_query);
    $log_stmt->bindParam(':user_id', $user['id']);
    $log_stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR']);
    $log_stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT']);
    $log_stmt->execute();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'user' => [
                'uid' => $user['uid'],
                'email' => $user['email'],
                'displayName' => $user['display_name'],
                'isAdmin' => (bool)$user['is_admin']
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
