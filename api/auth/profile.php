<?php
/**
 * Profile Endpoint
 * Handles user profile operations (get profile, verify token)
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
    
    // Verify token exists in database
    $session_query = "SELECT us.*, u.uid, u.email, u.display_name, u.is_admin, u.is_active, u.created_at, u.last_login
                      FROM user_sessions us
                      JOIN users u ON us.user_id = u.id
                      WHERE us.token_hash = :token_hash 
                      AND us.is_active = 1 
                      AND us.expires_at > NOW()
                      AND u.is_active = 1";
    $session_stmt = $db->prepare($session_query);
    $session_stmt->bindParam(':token_hash', hash('sha256', $token));
    $session_stmt->execute();
    
    $session = $session_stmt->fetch();
    
    if (!$session) {
        throw new Exception('Invalid or expired session');
    }
    
    // Handle different HTTP methods
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Return user profile
            echo json_encode([
                'success' => true,
                'data' => [
                    'user' => [
                        'uid' => $session['uid'],
                        'email' => $session['email'],
                        'displayName' => $session['display_name'],
                        'isAdmin' => (bool)$session['is_admin'],
                        'createdAt' => $session['created_at'],
                        'lastLogin' => $session['last_login']
                    ]
                ]
            ]);
            break;
            
        case 'PUT':
            // Update user profile
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Invalid JSON input');
            }
            
            $updateFields = [];
            $updateParams = [':user_id' => $session['user_id']];
            
            // Update display name if provided
            if (isset($input['displayName']) && !empty(trim($input['displayName']))) {
                $newName = trim($input['displayName']);
                if (strlen($newName) >= 2) {
                    $updateFields[] = 'display_name = :display_name';
                    $updateParams[':display_name'] = $newName;
                } else {
                    throw new Exception('Display name must be at least 2 characters long');
                }
            }
            
            // Update password if provided
            if (isset($input['currentPassword']) && isset($input['newPassword'])) {
                $currentPassword = $input['currentPassword'];
                $newPassword = $input['newPassword'];
                
                // Get current password hash
                $user_query = "SELECT password_hash FROM users WHERE id = :user_id";
                $user_stmt = $db->prepare($user_query);
                $user_stmt->bindParam(':user_id', $session['user_id']);
                $user_stmt->execute();
                $user = $user_stmt->fetch();
                
                if (!PasswordUtils::verify($currentPassword, $user['password_hash'])) {
                    throw new Exception('Current password is incorrect');
                }
                
                if (strlen($newPassword) < 6) {
                    throw new Exception('New password must be at least 6 characters long');
                }
                
                $passwordCheck = PasswordUtils::checkStrength($newPassword);
                if (!$passwordCheck['isValid']) {
                    throw new Exception('New password does not meet requirements');
                }
                
                $updateFields[] = 'password_hash = :password_hash';
                $updateParams[':password_hash'] = PasswordUtils::hash($newPassword);
            }
            
            if (empty($updateFields)) {
                throw new Exception('No valid fields to update');
            }
            
            $updateFields[] = 'updated_at = NOW()';
            $update_query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :user_id";
            $update_stmt = $db->prepare($update_query);
            
            foreach ($updateParams as $key => $value) {
                $update_stmt->bindValue($key, $value);
            }
            
            if (!$update_stmt->execute()) {
                throw new Exception('Failed to update profile');
            }
            
            // Log profile update
            $log_query = "INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent) 
                          VALUES (:user_id, 'profile_update', 'Profile updated successfully', :ip_address, :user_agent)";
            $log_stmt = $db->prepare($log_query);
            $log_stmt->bindParam(':user_id', $session['user_id']);
            $log_stmt->bindParam(':ip_address', $_SERVER['REMOTE_ADDR']);
            $log_stmt->bindParam(':user_agent', $_SERVER['HTTP_USER_AGENT']);
            $log_stmt->execute();
            
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
