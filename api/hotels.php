<?php
require_once '../config/config.php';

// Hotels API endpoint
class HotelsAPI {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->getHotels();
        } else {
            Response::error('Method not allowed', 405);
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
}

// Handle the request
try {
    $api = new HotelsAPI();
    $api->handleRequest();
} catch (Exception $e) {
    logActivity("Hotels API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
