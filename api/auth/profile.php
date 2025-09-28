<?php
require_once dirname(__DIR__, 2) . '/config/config.php';

// Handle profile requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

$token = getBearerToken();

if (!$token) {
    Response::error('Access token required', 401);
}

$auth = new Auth();
$user = $auth->validateToken($token);

if (!$user) {
    Response::error('Invalid or expired token', 401);
}

Response::success(['user' => $user]);

function getBearerToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return $matches[1];
    }
    
    return null;
}
?>
