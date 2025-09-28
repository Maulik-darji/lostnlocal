<?php
/**
 * Simple Test Endpoint
 * For testing API connectivity and basic functionality
 */

// Set JSON response header
header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Test database connection
    require_once '../config/database.php';
    $database = new Database();
    $dbConnected = $database->testConnection();
    
    // Get request info
    $method = $_SERVER['REQUEST_METHOD'];
    $input = null;
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
    }
    
    // Test JWT functionality
    require_once '../config/jwt.php';
    $testPayload = ['user_id' => 1, 'email' => 'test@example.com'];
    $testToken = JWT::generate($testPayload);
    $verifiedPayload = JWT::verify($testToken);
    
    // Test password utilities
    require_once '../config/password.php';
    $testPassword = 'test123';
    $hashedPassword = PasswordUtils::hash($testPassword);
    $passwordVerified = PasswordUtils::verify($testPassword, $hashedPassword);
    
    $response = [
        'success' => true,
        'message' => 'API is working correctly',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => [
            'method' => $method,
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'
        ],
        'tests' => [
            'database_connection' => $dbConnected,
            'jwt_generation' => !empty($testToken),
            'jwt_verification' => !empty($verifiedPayload),
            'password_hashing' => !empty($hashedPassword),
            'password_verification' => $passwordVerified
        ]
    ];
    
    if ($input) {
        $response['received_data'] = $input;
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'API test failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
