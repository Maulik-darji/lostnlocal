<?php
require_once '../config/config.php';

// Contact API endpoint
class ContactAPI {
    private $db;
    private $auth;
    
    public function __construct() {
        $this->db = new Database();
        $this->auth = new Auth();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'POST') {
            $this->submitContact();
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    
    private function submitContact() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $requiredFields = ['name', 'email', 'subject', 'message'];
        $errors = Validator::validateRequired($requiredFields, $input);
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
        }
        
        $name = Validator::sanitizeInput($input['name']);
        $email = Validator::sanitizeInput($input['email']);
        $subject = Validator::sanitizeInput($input['subject']);
        $message = Validator::sanitizeInput($input['message']);
        
        // Validate input
        if (!Validator::validateName($name)) {
            Response::error('Name must be between 2 and 255 characters', 400);
        }
        
        if (!Validator::validateEmail($email)) {
            Response::error('Invalid email format', 400);
        }
        
        if (!Validator::validateName($subject)) {
            Response::error('Subject must be between 2 and 255 characters', 400);
        }
        
        if (strlen($message) < 10 || strlen($message) > 1000) {
            Response::error('Message must be between 10 and 1000 characters', 400);
        }
        
        $userId = null;
        $token = $this->getBearerToken();
        if ($token) {
            $user = $this->auth->validateToken($token);
            if ($user) {
                $userId = $user['id'];
            }
        }
        
        try {
            $this->db->execute(
                "INSERT INTO contact_messages (name, email, subject, message, user_id) VALUES (?, ?, ?, ?, ?)",
                [$name, $email, $subject, $message, $userId]
            );
            
            logActivity("Contact message submitted: $subject from $email");
            
            Response::success(null, 'Message sent successfully! We\'ll get back to you soon.', 201);
            
        } catch (Exception $e) {
            logActivity("Error submitting contact form: " . $e->getMessage(), 'ERROR');
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
    $api = new ContactAPI();
    $api->handleRequest();
} catch (Exception $e) {
    logActivity("Contact API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
