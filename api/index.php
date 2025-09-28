<?php
require_once '../config/config.php';

// Main API endpoints for LostnLocal
class LostnLocalAPI {
    private $db;
    private $auth;
    
    public function __construct() {
        $this->db = new Database();
        $this->auth = new Auth();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        // Remove 'api' from path parts
        $pathParts = array_slice($pathParts, 1);
        $endpoint = $pathParts[0] ?? '';
        
        switch ($endpoint) {
            case 'health':
                $this->health();
                break;
                
            case 'destinations':
                if ($method === 'GET') {
                    $this->getDestinations();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'hotels':
                if ($method === 'GET') {
                    $this->getHotels();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'cultural-insights':
                if ($method === 'GET') {
                    $this->getCulturalInsights();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'hidden-gems':
                if ($method === 'GET') {
                    $this->getHiddenGems();
                } elseif ($method === 'POST') {
                    $this->submitHiddenGem();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'contact':
                if ($method === 'POST') {
                    $this->submitContact();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'admin':
                $this->handleAdminRequest($pathParts, $method);
                break;
                
            default:
                Response::error('Endpoint not found', 404);
        }
    }
    
    private function health() {
        Response::success([
            'status' => 'OK',
            'message' => 'LostnLocal API is running',
            'version' => '1.0.0'
        ]);
    }
    
    private function getDestinations() {
        try {
            $destinations = $this->db->fetchAll(
                "SELECT * FROM destinations ORDER BY rating DESC, created_at DESC"
            );
            
            Response::success($destinations);
        } catch (Exception $e) {
            logActivity("Error loading destinations: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function getHotels() {
        try {
            $hotels = $this->db->fetchAll(
                "SELECT * FROM hotels ORDER BY rating DESC, created_at DESC"
            );
            
            // Parse amenities JSON
            foreach ($hotels as &$hotel) {
                $hotel['amenities'] = $hotel['amenities'] ? json_decode($hotel['amenities'], true) : [];
            }
            
            Response::success($hotels);
        } catch (Exception $e) {
            logActivity("Error loading hotels: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function getCulturalInsights() {
        try {
            $insights = $this->db->fetchAll(
                "SELECT * FROM cultural_insights ORDER BY created_at DESC"
            );
            
            Response::success($insights);
        } catch (Exception $e) {
            logActivity("Error loading cultural insights: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
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
    
    private function handleAdminRequest($pathParts, $method) {
        $token = $this->getBearerToken();
        
        if (!$token) {
            Response::error('Access token required', 401);
        }
        
        $user = $this->auth->validateToken($token);
        
        if (!$user) {
            Response::error('Invalid or expired token', 401);
        }
        
        if (!$user['is_admin']) {
            Response::error('Admin access required', 403);
        }
        
        $adminEndpoint = $pathParts[1] ?? '';
        
        switch ($adminEndpoint) {
            case 'pending-gems':
                if ($method === 'GET') {
                    $this->getPendingGems();
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'approve-gem':
                if ($method === 'PUT') {
                    $gemId = $pathParts[2] ?? '';
                    $this->approveGem($gemId);
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            case 'reject-gem':
                if ($method === 'DELETE') {
                    $gemId = $pathParts[2] ?? '';
                    $this->rejectGem($gemId);
                } else {
                    Response::error('Method not allowed', 405);
                }
                break;
                
            default:
                Response::error('Admin endpoint not found', 404);
        }
    }
    
    private function getPendingGems() {
        try {
            $gems = $this->db->fetchAll(
                "SELECT hg.*, u.name as submitted_by_name 
                 FROM hidden_gems hg 
                 JOIN users u ON hg.submitted_by = u.id 
                 WHERE hg.approved = 0 
                 ORDER BY hg.created_at DESC"
            );
            
            Response::success($gems);
        } catch (Exception $e) {
            logActivity("Error loading pending gems: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function approveGem($gemId) {
        if (!is_numeric($gemId)) {
            Response::error('Invalid gem ID', 400);
        }
        
        try {
            $this->db->execute(
                "UPDATE hidden_gems SET approved = 1, approved_at = NOW() WHERE id = ?",
                [$gemId]
            );
            
            logActivity("Hidden gem approved: ID $gemId");
            Response::success(null, 'Hidden gem approved successfully');
            
        } catch (Exception $e) {
            logActivity("Error approving gem: " . $e->getMessage(), 'ERROR');
            Response::error('Internal server error', 500);
        }
    }
    
    private function rejectGem($gemId) {
        if (!is_numeric($gemId)) {
            Response::error('Invalid gem ID', 400);
        }
        
        try {
            $this->db->execute(
                "DELETE FROM hidden_gems WHERE id = ?",
                [$gemId]
            );
            
            logActivity("Hidden gem rejected: ID $gemId");
            Response::success(null, 'Hidden gem rejected and removed');
            
        } catch (Exception $e) {
            logActivity("Error rejecting gem: " . $e->getMessage(), 'ERROR');
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
    $api = new LostnLocalAPI();
    $api->handleRequest();
} catch (Exception $e) {
    logActivity("API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
