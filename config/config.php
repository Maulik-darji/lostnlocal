<?php
// LostnLocal PHP Configuration
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'lostnlocal_db');
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration
define('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random');
define('JWT_EXPIRES_IN', 86400); // 24 hours in seconds

// Admin Configuration
define('ADMIN_CODE', '#14224#');

// Security Configuration
define('BCRYPT_COST', 12);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes

// CORS Configuration
define('ALLOWED_ORIGINS', ['http://localhost', 'http://127.0.0.1']);

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('UTC');

// Start session
session_start();

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection class
class Database {
    private $connection;
    
    public function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    public function prepare($sql) {
        return $this->connection->prepare($sql);
    }
    
    public function execute($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    public function fetchAll($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function fetchOne($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }
    
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }
}

// JWT Token class
class JWT {
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['exp'] = time() + JWT_EXPIRES_IN;
        $payload['iat'] = time();
        $payload = json_encode($payload);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        if (!hash_equals($expectedSignature, $base64Signature)) {
            return false;
        }
        
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
        
        if ($payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
}

// Response helper class
class Response {
    public static function success($data = null, $message = 'Success', $code = 200) {
        http_response_code($code);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
    
    public static function error($message = 'Error', $code = 400, $errors = null) {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
}

// Input validation class
class Validator {
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function validatePassword($password) {
        return strlen($password) >= 6;
    }
    
    public static function validateName($name) {
        return strlen(trim($name)) >= 2 && strlen(trim($name)) <= 255;
    }
    
    public static function sanitizeInput($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    public static function validateRequired($fields, $data) {
        $errors = [];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $errors[$field] = ucfirst($field) . ' is required';
            }
        }
        return $errors;
    }
}

// Authentication helper class
class Auth {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
    }
    
    public function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    public function generateToken($userId, $email, $isAdmin = false) {
        $payload = [
            'userId' => $userId,
            'email' => $email,
            'isAdmin' => $isAdmin
        ];
        return JWT::encode($payload);
    }
    
    public function validateToken($token) {
        $decoded = JWT::decode($token);
        if (!$decoded) {
            return false;
        }
        
        // Check if token exists in database and is still valid
        $session = $this->db->fetchOne(
            "SELECT * FROM user_sessions WHERE token_hash = ? AND is_active = 1 AND expires_at > NOW()",
            [hash('sha256', $token)]
        );
        
        if (!$session) {
            return false;
        }
        
        // Get user details
        $user = $this->db->fetchOne(
            "SELECT id, uid, name, email, is_admin, is_active FROM users WHERE id = ? AND is_active = 1",
            [$decoded['userId']]
        );
        
        if (!$user) {
            return false;
        }
        
        return $user;
    }
    
    public function storeSession($userId, $token) {
        $tokenHash = hash('sha256', $token);
        $expiresAt = date('Y-m-d H:i:s', time() + JWT_EXPIRES_IN);
        
        $this->db->execute(
            "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            [$userId, $tokenHash, $expiresAt]
        );
    }
    
    public function invalidateSession($token) {
        $tokenHash = hash('sha256', $token);
        $this->db->execute(
            "UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?",
            [$tokenHash]
        );
    }
    
    public function invalidateAllUserSessions($userId) {
        $this->db->execute(
            "UPDATE user_sessions SET is_active = 0 WHERE user_id = ?",
            [$userId]
        );
    }
}

// Rate limiting helper
class RateLimiter {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function checkRateLimit($identifier, $maxAttempts, $timeWindow) {
        $sql = "SELECT COUNT(*) as attempts FROM rate_limits 
                WHERE identifier = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)";
        $result = $this->db->fetchOne($sql, [$identifier, $timeWindow]);
        
        return $result['attempts'] < $maxAttempts;
    }
    
    public function recordAttempt($identifier) {
        $this->db->execute(
            "INSERT INTO rate_limits (identifier, created_at) VALUES (?, NOW())",
            [$identifier]
        );
    }
}

// Get client IP address
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

// Log function
function logActivity($message, $level = 'INFO') {
    $logFile = 'logs/activity.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = getClientIP();
    $logEntry = "[$timestamp] [$level] [$ip] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

// Initialize database and create tables if they don't exist
try {
    $db = new Database();
    
    // Create rate_limits table if it doesn't exist
    $db->execute("
        CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_identifier_time (identifier, created_at)
        )
    ");
    
    logActivity("Database connection established successfully");
    
} catch (Exception $e) {
    logActivity("Database connection failed: " . $e->getMessage(), 'ERROR');
    Response::error("Database connection failed", 500);
}
?>
