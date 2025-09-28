<?php
/**
 * Database Setup Script for LostnLocal
 * Run this script to initialize the database
 */

// Include configuration
require_once 'config/database.php';

echo "<h1>LostnLocal Database Setup</h1>\n";
echo "<p>Setting up database and tables...</p>\n";

try {
    // Connect to MySQL server (without database)
    $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
    $pdo = new PDO($dsn, DB_USER, DB_PASSWORD);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✓ Connected to MySQL server</p>\n";
    
    // Read and execute schema
    $schema = file_get_contents('database/schema.sql');
    $statements = explode(';', $schema);
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (!empty($statement) && !preg_match('/^--/', $statement)) {
            try {
                $pdo->exec($statement);
            } catch (PDOException $e) {
                // Ignore errors for statements that might already exist
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "<p>⚠ Warning: " . htmlspecialchars($e->getMessage()) . "</p>\n";
                }
            }
        }
    }
    
    echo "<p>✓ Database schema created successfully</p>\n";
    
    // Test database connection
    $database = new Database();
    if ($database->testConnection()) {
        echo "<p>✓ Database connection test successful</p>\n";
        
        // Show tables
        $db = $database->getConnection();
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        
        echo "<h2>Created Tables:</h2>\n";
        echo "<ul>\n";
        foreach ($tables as $table) {
            echo "<li>" . htmlspecialchars($table) . "</li>\n";
        }
        echo "</ul>\n";
        
        // Check if admin user exists
        $admin_check = $db->query("SELECT COUNT(*) FROM users WHERE is_admin = 1")->fetchColumn();
        if ($admin_check > 0) {
            echo "<p>✓ Admin user created (email: admin@lostnlocal.com, password: admin123)</p>\n";
        }
        
    } else {
        echo "<p>✗ Database connection test failed</p>\n";
    }
    
    echo "<h2>Setup Complete!</h2>\n";
    echo "<p>You can now use the authentication system.</p>\n";
    echo "<p><a href='auth.html'>Go to Login Page</a></p>\n";
    echo "<p><a href='api/test-simple.php'>Test API</a></p>\n";
    
} catch (Exception $e) {
    echo "<p>✗ Setup failed: " . htmlspecialchars($e->getMessage()) . "</p>\n";
    echo "<p>Please check your XAMPP MySQL configuration.</p>\n";
}
?>
