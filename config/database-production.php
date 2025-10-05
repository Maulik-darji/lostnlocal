<?php
/**
 * Database Configuration for LostnLocal - Production (profreehost.com)
 * Shared Hosting MySQL Connection Settings
 */

class Database {
    // UPDATE THESE VALUES WITH YOUR PROFREEHOST.COM DATABASE CREDENTIALS
    private $host = 'localhost'; // Usually 'localhost' for shared hosting
    private $db_name = 'ezyro_40046878_lostnlocal_db'; // Replace with your actual database name
    private $username = 'ezyro_40046878'; // Replace with your actual database username
    private $password = 'your_database_password'; // Replace with your actual database password
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

// Database configuration constants - UPDATE THESE VALUES
define('DB_HOST', 'localhost');
define('DB_NAME', 'ezyro_40046878_lostnlocal_db'); // Replace with your actual database name
define('DB_USER', 'ezyro_40046878'); // Replace with your actual database username
define('DB_PASSWORD', 'your_database_password'); // Replace with your actual database password
define('DB_CHARSET', 'utf8mb4');

// JWT Configuration - CHANGE THIS IN PRODUCTION
define('JWT_SECRET', 'lostnlocal_jwt_secret_key_2024_change_in_production');
define('JWT_EXPIRES_IN', 86400); // 24 hours in seconds

// Admin Configuration
define('ADMIN_CODE', '#14224#');

// Security Configuration
define('BCRYPT_SALT_ROUNDS', 12);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOCKOUT_TIME', 900); // 15 minutes

// CORS Configuration - UPDATE WITH YOUR DOMAIN
define('ALLOWED_ORIGINS', [
    'https://yourdomain.com', // Replace with your actual domain
    'https://www.yourdomain.com', // Replace with your actual domain
    'http://localhost', // Keep for development
    'http://localhost:3000'
]);

// Error reporting (disable in production)
error_reporting(0);
ini_set('display_errors', 0);

// Set timezone
date_default_timezone_set('UTC');

// Start session if not already started
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>

