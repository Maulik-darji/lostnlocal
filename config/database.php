<?php
/**
 * Database Configuration for LostnLocal
 * XAMPP MySQL Connection Settings
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'lostnlocal_db';
    private $username = 'root';
    private $password = ''; // Default XAMPP password is empty
    private $charset = 'utf8mb4';
    private $conn;

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }

        return $this->conn;
    }

    /**
     * Test database connection
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            $stmt = $conn->query("SELECT 1");
            return true;
        } catch(Exception $e) {
            return false;
        }
    }
}

// Database configuration constants
define('DB_HOST', 'localhost');
define('DB_NAME', 'lostnlocal_db');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration
define('JWT_SECRET', 'lostnlocal_jwt_secret_key_2024_change_in_production');
define('JWT_EXPIRES_IN', 86400); // 24 hours in seconds

// Admin Configuration
define('ADMIN_CODE', '#14224#');

// Security Configuration
define('BCRYPT_SALT_ROUNDS', 12);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'http://127.0.0.1:3000'
]);

// Error reporting (disable in production)
if (defined('DEVELOPMENT') && DEVELOPMENT) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set timezone
date_default_timezone_set('UTC');

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>
