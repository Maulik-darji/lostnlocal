<?php
require_once '../config/config.php';

// Health check endpoint
try {
    $db = new Database();
    
    // Test database connection
    $db->fetchOne("SELECT 1 as test");
    
    Response::success([
        'status' => 'OK',
        'message' => 'LostnLocal API is running',
        'version' => '1.0.0',
        'database' => 'Connected',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    Response::error('Health check failed: ' . $e->getMessage(), 500);
}
?>
