<?php
require_once '../config/config.php';

// Hidden Gems API endpoint
class HiddenGemsAPI {
    private $db;
    private $auth;
    
    public function __construct() {
        $this->db = new Database();
        $this->auth = new Auth();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->getHiddenGems();
        } elseif ($method === 'POST') {
            $this->submitHiddenGem();
        } else {
            Response::error('Method not allowed', 405);
        }
    }
    
    private function getHiddenGems() {
        try {
            $gems = $this->db->fetchAll(
                "SELECT hg.*, u.name as submitted_by_name 
                 FROM hidden_gems hg 
                 JOIN users u ON hg.submitted_by = u.id 
                 WHERE hg.approved = 1 
                 ORDER BY hg.approved_at DESC"
            );
            
            Response::success($gems);
        } catch (Exception $e) {
            logActivity("Error loading hidden gems: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function submitHiddenGem() {
        $token = $this->getBearerToken();
        
        if (!$token) {
            Response::error('Access token required', 401);
        }
        
        $user = $this->auth->validateToken($token);
        
        if (!$user) {
            Response::error('Invalid or expired token', 401);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        $requiredFields = ['name', 'location', 'description', 'category'];
        $errors = Validator::validateRequired($requiredFields, $input);
        
        if (!empty($errors)) {
            Response::error('Validation failed', 400, $errors);
        }
        
        $name = Validator::sanitizeInput($input['name']);
        $location = Validator::sanitizeInput($input['location']);
        $description = Validator::sanitizeInput($input['description']);
        $category = Validator::sanitizeInput($input['category']);
        
        // Validate input
        if (!Validator::validateName($name)) {
            Response::error('Name must be between 2 and 255 characters', 400);
        }
        
        if (!Validator::validateName($location)) {
            Response::error('Location must be between 2 and 255 characters', 400);
        }
        
        if (strlen($description) < 10 || strlen($description) > 1000) {
            Response::error('Description must be between 10 and 1000 characters', 400);
        }
        
        $validCategories = ['nature', 'cultural', 'adventure', 'food', 'other'];
        if (!in_array($category, $validCategories)) {
            Response::error('Invalid category', 400);
        }
        
        try {
            $this->db->execute(
                "INSERT INTO hidden_gems (name, location, description, category, submitted_by) VALUES (?, ?, ?, ?, ?)",
                [$name, $location, $description, $category, $user['id']]
            );
            
            $gemId = $this->db->lastInsertId();
            
            logActivity("Hidden gem submitted: $name by " . $user['email']);
            
            Response::success([
                'id' => $gemId,
                'name' => $name,
                'location' => $location,
                'description' => $description,
                'category' => $category,
                'submittedBy' => $user['name']
            ], 'Hidden gem submitted successfully! It will appear after admin approval.', 201);
            
        } catch (Exception $e) {
            logActivity("Error submitting hidden gem: " . $e->getMessage(), 'ERROR');
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
    $api = new HiddenGemsAPI();
    $api->handleRequest();
} catch (Exception $e) {
    logActivity("Hidden Gems API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
