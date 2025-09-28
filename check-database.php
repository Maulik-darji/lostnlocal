<?php
/**
 * Database Verification Script
 * Check if users are being saved to the database
 */

// Include database configuration
require_once 'config/database.php';

echo "<h1>LostnLocal Database Verification</h1>\n";
echo "<p>Checking if users are being saved to the database...</p>\n";

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Failed to connect to database");
    }
    
    echo "<p>✓ Database connection successful</p>\n";
    
    // Check if users table exists
    $tables_query = "SHOW TABLES LIKE 'users'";
    $tables_result = $db->query($tables_query);
    
    if ($tables_result->rowCount() == 0) {
        echo "<p>✗ Users table does not exist!</p>\n";
        echo "<p>Please run the database setup first: <a href='setup-database.php'>Setup Database</a></p>\n";
        exit();
    }
    
    echo "<p>✓ Users table exists</p>\n";
    
    // Get all users
    $users_query = "SELECT id, uid, email, display_name, is_admin, is_active, created_at, last_login FROM users ORDER BY created_at DESC";
    $users_result = $db->query($users_query);
    $users = $users_result->fetchAll();
    
    echo "<h2>Users in Database (" . count($users) . " total)</h2>\n";
    
    if (count($users) == 0) {
        echo "<p>No users found in database.</p>\n";
        echo "<p>Try creating a user account through the signup form.</p>\n";
    } else {
        echo "<table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; width: 100%;'>\n";
        echo "<tr style='background: #f0f0f0;'>\n";
        echo "<th>ID</th><th>UID</th><th>Email</th><th>Name</th><th>Admin</th><th>Active</th><th>Created</th><th>Last Login</th>\n";
        echo "</tr>\n";
        
        foreach ($users as $user) {
            $admin_status = $user['is_admin'] ? 'Yes' : 'No';
            $active_status = $user['is_active'] ? 'Yes' : 'No';
            $created_at = $user['created_at'] ? date('Y-m-d H:i:s', strtotime($user['created_at'])) : 'Never';
            $last_login = $user['last_login'] ? date('Y-m-d H:i:s', strtotime($user['last_login'])) : 'Never';
            
            echo "<tr>\n";
            echo "<td>" . htmlspecialchars($user['id']) . "</td>\n";
            echo "<td>" . htmlspecialchars($user['uid']) . "</td>\n";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>\n";
            echo "<td>" . htmlspecialchars($user['display_name']) . "</td>\n";
            echo "<td>" . $admin_status . "</td>\n";
            echo "<td>" . $active_status . "</td>\n";
            echo "<td>" . $created_at . "</td>\n";
            echo "<td>" . $last_login . "</td>\n";
            echo "</tr>\n";
        }
        
        echo "</table>\n";
    }
    
    // Check user sessions
    $sessions_query = "SELECT COUNT(*) as session_count FROM user_sessions WHERE is_active = 1";
    $sessions_result = $db->query($sessions_query);
    $session_count = $sessions_result->fetch()['session_count'];
    
    echo "<h2>Active Sessions</h2>\n";
    echo "<p>Active user sessions: " . $session_count . "</p>\n";
    
    // Check activity logs
    $logs_query = "SELECT COUNT(*) as log_count FROM activity_logs";
    $logs_result = $db->query($logs_query);
    $log_count = $logs_result->fetch()['log_count'];
    
    echo "<h2>Activity Logs</h2>\n";
    echo "<p>Total activity log entries: " . $log_count . "</p>\n";
    
    // Show recent activity
    if ($log_count > 0) {
        $recent_logs_query = "SELECT action, description, created_at FROM activity_logs ORDER BY created_at DESC LIMIT 5";
        $recent_logs_result = $db->query($recent_logs_query);
        $recent_logs = $recent_logs_result->fetchAll();
        
        echo "<h3>Recent Activity</h3>\n";
        echo "<ul>\n";
        foreach ($recent_logs as $log) {
            $time = date('Y-m-d H:i:s', strtotime($log['created_at']));
            echo "<li><strong>" . htmlspecialchars($log['action']) . "</strong> - " . htmlspecialchars($log['description']) . " (" . $time . ")</li>\n";
        }
        echo "</ul>\n";
    }
    
    echo "<h2>Test Actions</h2>\n";
    echo "<p><a href='auth.html'>Go to Login/Signup Page</a></p>\n";
    echo "<p><a href='api/test-simple.php'>Test API</a></p>\n";
    echo "<p><a href='admin-test.html'>Admin Test Page</a></p>\n";
    
} catch (Exception $e) {
    echo "<p>✗ Error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
    echo "<p>Please check your database configuration and ensure XAMPP MySQL is running.</p>\n";
}
?>
