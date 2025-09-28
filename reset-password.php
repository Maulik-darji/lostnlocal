<?php
/**
 * Password Reset Script
 * Use this to reset a user's password to a known value
 */

// Include required files
require_once 'config/database.php';
require_once 'config/password.php';

echo "<h1>Password Reset Tool</h1>\n";

if ($_POST) {
    $email = $_POST['email'] ?? '';
    $newPassword = $_POST['password'] ?? '';
    
    if (empty($email) || empty($newPassword)) {
        echo "<p style='color: red;'>Email and password are required.</p>\n";
    } else {
        try {
            $database = new Database();
            $db = $database->getConnection();
            
            // Check if user exists
            $check_query = "SELECT id, email, display_name FROM users WHERE email = :email";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->bindParam(':email', $email);
            $check_stmt->execute();
            
            $user = $check_stmt->fetch();
            
            if (!$user) {
                echo "<p style='color: red;'>User not found with email: " . htmlspecialchars($email) . "</p>\n";
            } else {
                // Update password
                $hashedPassword = PasswordUtils::hash($newPassword);
                
                $update_query = "UPDATE users SET password_hash = :password_hash, updated_at = NOW() WHERE email = :email";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(':password_hash', $hashedPassword);
                $update_stmt->bindParam(':email', $email);
                
                if ($update_stmt->execute()) {
                    echo "<p style='color: green;'>✅ Password updated successfully for " . htmlspecialchars($user['display_name']) . " (" . htmlspecialchars($email) . ")</p>\n";
                    echo "<p>New password: <strong>" . htmlspecialchars($newPassword) . "</strong></p>\n";
                } else {
                    echo "<p style='color: red;'>Failed to update password.</p>\n";
                }
            }
            
        } catch (Exception $e) {
            echo "<p style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</p>\n";
        }
    }
}

echo "<form method='POST'>\n";
echo "<p><label>Email: <input type='email' name='email' value='maulik.darji2005@gmail.com' required></label></p>\n";
echo "<p><label>New Password: <input type='text' name='password' value='test123' required></label></p>\n";
echo "<p><button type='submit'>Reset Password</button></p>\n";
echo "</form>\n";

echo "<p><a href='auth.html'>Go to Login Page</a></p>\n";
echo "<p><a href='check-database.php'>Check Database</a></p>\n";
?>
