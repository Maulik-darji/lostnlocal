<?php
require_once '../config/config.php';

// Destinations API endpoint
class DestinationsAPI {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->getDestinations();
        } else {
            Response::error('Method not allowed', 405);
        }
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
}

// Handle the request
try {
    $api = new DestinationsAPI();
    $api->handleRequest();
} catch (Exception $e) {
    logActivity("Destinations API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
