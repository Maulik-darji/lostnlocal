<?php
require_once '../config/config.php';

// Cultural Insights API endpoint
class CulturalInsightsAPI {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($method === 'GET') {
            $this->getCulturalInsights();
        } else {
            Response::error('Method not allowed', 405);
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
}

// Handle the request
try {
    $api = new CulturalInsightsAPI();
    $api->handleRequest();
} catch (Exception $e) {
    logActivity("Cultural Insights API error: " . $e->getMessage(), 'ERROR');
    Response::error('Internal server error', 500);
}
?>
