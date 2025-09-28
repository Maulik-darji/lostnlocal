<?php
/**
 * LostnLocal API - Main Entry Point
 * Handles CORS and routing for authentication endpoints
 */

// Include configuration files
require_once '../config/database.php';
require_once '../config/jwt.php';
require_once '../config/password.php';

// Set CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Remove 'lostnlocal/api' from path
if (isset($path_parts[0]) && $path_parts[0] === 'lostnlocal') {
    array_shift($path_parts);
}
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    array_shift($path_parts);
}

$endpoint = isset($path_parts[0]) ? $path_parts[0] : '';
$action = isset($path_parts[1]) ? $path_parts[1] : '';

// Route to appropriate endpoint
switch ($endpoint) {
    case 'auth':
        switch ($action) {
            case 'login':
                include 'auth/login.php';
                break;
            case 'signup':
                include 'auth/signup.php';
                break;
            case 'profile':
                include 'auth/profile.php';
                break;
            case 'logout':
                include 'auth/logout.php';
                break;
            default:
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Auth endpoint not found']);
                break;
        }
        break;
    case 'test':
        include 'test-simple.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'API endpoint not found']);
        break;
}
?>
