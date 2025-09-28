<?php
require_once 'config/config.php';

// Authentication API endpoints
class AuthAPI {
    private $db;
    private $auth;
    private $rateLimiter;
    
    public function __construct() {
        $this->db = new Database();
        $this->auth = new Auth();
        $this->rateLimiter = new RateLimiter();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        // Remove 'api' and 'auth' from path parts
        $pathParts = array_slice($pathParts, 2);
        $endpoint = $pathParts[0] ?? '';
        
        switch ($endpoint) {
            case 'signup':
                if ($method === 'POST') {
                    $this->signup();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'login':
                if ($method === 'POST') {
                    $this->login();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'logout':
                if ($method === 'POST') {
                    $this->logout();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'profile':
                if ($method === 'GET') {
                    $this->getProfile();
                } elseif ($method === 'PUT') {
                    $this->updateProfile();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'change-password':
                if ($method === 'PUT') {
                    $this->changePassword();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            default:
                Response::error('Endpoint not found', 404);
        }
    }
    
    private function signup() {
        $clientIP = getClientIP();
        
        // Rate limiting
        if (!$this->rateLimiter->checkRateLimit($clientIP, 5, 900)) {
            Response::error('Too many signup attempts. Please try again later.', 429);
        }
        
        $this->rateLimiter->recordAttempt($clientIP);
        
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
        $existingUser = $this->db->fetchOne(
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
        $hashedPassword = $this->auth->hashPassword($password);
        
        // Generate unique UID
        $uid = 'user_' . time() . '_' . bin2hex(random_bytes(4));
        
        try {
            // Insert user
            $this->db->execute(
                "INSERT INTO users (uid, name, email, password, is_admin) VALUES (?, ?, ?, ?, ?)",
                [$uid, $name, $email, $hashedPassword, $isAdmin]
            );
            
            $userId = $this->db->lastInsertId();
            
            // Generate JWT token
            $token = $this->auth->generateToken($userId, $email, $isAdmin);
            
            // Store session
            $this->auth->storeSession($userId, $token);
            
            // Update last login
            $this->db->execute(
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
    }
    
    private function login() {
        $clientIP = getClientIP();
        
        // Rate limiting
        if (!$this->rateLimiter->checkRateLimit($clientIP, 5, 900)) {
            Response::error('Too many login attempts. Please try again later.', 429);
        }
        
        $this->rateLimiter->recordAttempt($clientIP);
        
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
        $user = $this->db->fetchOne(
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
        if (!$this->auth->verifyPassword($password, $user['password'])) {
            logActivity("Failed login attempt: $email (invalid password)");
            Response::error('Invalid email or password', 401);
        }
        
        try {
            // Generate JWT token
            $token = $this->auth->generateToken($user['id'], $user['email'], $user['is_admin']);
            
            // Store session
            $this->auth->storeSession($user['id'], $token);
            
            // Update last login
            $this->db->execute(
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
    }
    
    private function logout() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            Response::error('Access token required', 401);
        }
        
        try {
            $this->auth->invalidateSession($token);
            logActivity("User logged out successfully");
            Response::success(null, 'Logout successful');
        } catch (Exception $e) {
            logActivity("Logout error: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error during logout', 500);
        }
    }
    
    private function getProfile() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            Response::error('Access token required', 401);
        }
        
        $user = $this->auth->validateToken($token);
        
        if (!$user) {
            Response::error('Invalid or expired token', 401);
        }
        
        Response::success(['user' => $user]);
    }
    
    private function updateProfile() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            Response::error('Access token required', 401);
        }
        
        $user = $this->auth->validateToken($token);
        
        if (!$user) {
            Response::error('Invalid or expired token', 401);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $updates = [];
        $values = [];
        
        if (isset($input['name'])) {
            $name = Validator::sanitizeInput($input['name']);
            if (!Validator::validateName($name)) {
                Response::error('Name must be between 2 and 255 characters', 400);
            }
            $updates[] = 'name = ?';
            $values[] = $name;
        }
        
        if (isset($input['email'])) {
            $email = Validator::sanitizeInput($input['email']);
            if (!Validator::validateEmail($email)) {
                Response::error('Invalid email format', 400);
            }
            
            // Check if email is already taken by another user
            $existingUser = $this->db->fetchOne(
                "SELECT id FROM users WHERE email = ? AND id != ?",
                [$email, $user['id']]
            );
            
            if ($existingUser) {
                Response::error('Email is already taken by another user', 409);
            }
            
            $updates[] = 'email = ?';
            $values[] = $email;
        }
        
        if (empty($updates)) {
            Response::error('No valid fields to update', 400);
        }
        
        $values[] = $user['id'];
        
        try {
            $this->db->execute(
                "UPDATE users SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?",
                $values
            );
            
            // Get updated user data
            $updatedUser = $this->db->fetchOne(
                "SELECT id, uid, name, email, is_admin, is_active FROM users WHERE id = ?",
                [$user['id']]
            );
            
            logActivity("Profile updated: " . $user['email']);
            Response::success(['user' => $updatedUser], 'Profile updated successfully');
            
        } catch (Exception $e) {
            logActivity("Profile update error: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function changePassword() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            Response::error('Access token required', 401);
        }
        
        $user = $this->auth->validateToken($token);
        
        if (!$user) {
            Response::error('Invalid or expired token', 401);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        $requiredFields = ['currentPassword', 'newPassword'];
        $errors = Validator::validateRequired($requiredFields, $input);
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
        }
        
        $currentPassword = $input['currentPassword'];
        $newPassword = $input['newPassword'];
        
        if (!Validator::validatePassword($newPassword)) {
            Response::error('New password must be at least 6 characters long', 400);
        }
        
        // Get current password hash
        $userData = $this->db->fetchOne(
            "SELECT password FROM users WHERE id = ?",
            [$user['id']]
        );
        
        if (!$userData) {
            Response::error('User not found', 404);
        }
        
        // Verify current password
        if (!$this->auth->verifyPassword($currentPassword, $userData['password'])) {
            Response::error('Current password is incorrect', 401);
        }
        
        try {
            // Hash new password
            $hashedPassword = $this->auth->hashPassword($newPassword);
            
            // Update password
            $this->db->execute(
                "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
                [$hashedPassword, $user['id']]
            );
            
            // Invalidate all existing sessions
            $this->auth->invalidateAllUserSessions($user['id']);
            
            logActivity("Password changed: " . $user['email']);
            Response::success(null, 'Password changed successfully. Please login again.');
            
        } catch (Exception $e) {
            logActivity("Password change error: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function getBearerToken() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}

// Handle the request
try {
    $authAPI = new AuthAPI();
    $authAPI->handleRequest();
} catch (Exception $e) {
    logActivity("API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
