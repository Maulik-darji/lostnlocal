<?php
/**
 * Logout Endpoint
 * Handles user logout and session cleanup
 */

// Include required files
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../config/password.php';

// Get authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($authHeader) || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authorization token required']);
    exit();
}

$token = $matches[1];

try {
    // Verify JWT token
    $payload = JWT::verify($token);
    if (!$payload) {
        throw new Exception('Invalid or expired token');
    }
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Deactivate session
    $logout_query = "UPDATE user_sessions 
                     SET is_active = 0 
                     WHERE token_hash = :token_hash AND user_id = :user_id";
    $logout_stmt = $db->prepare($logout_query);
    $logout_stmt->bindParam(':token_hash', hash('sha256', $token));
    $logout_stmt->bindParam(':user_id', $payload['user_id']);
    $logout_stmt->execute();
    
    // Log logout
    $log_query = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                  VALUES (:user_id, 'logout', 'User logged out successfully', :ip_address, :user_agent)";
    $log_stmt = $db->prepare($log_query);
    $log_stmt->bindParam(':user_id', $payload['user_id']);
    $log_stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR']);
    $log_stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT']);
    $log_stmt->execute();
    
    // Clean up expired sessions
    $cleanup_query = "UPDATE user_sessions SET is_active = 0 WHERE expires_at < NOW()";
    $db->exec($cleanup_query);
    
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
