<?php
/**
 * Password Utilities for LostnLocal
 * Password hashing and validation functions
 */

class PasswordUtils {
    
    /**
     * Hash password using bcrypt
     */
    public static function hash($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_SALT_ROUNDS]);
    }
    
    /**
     * Verify password against hash
     */
    public static function verify($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Check password strength
     */
    public static function checkStrength($password) {
        $score = 0;
        $feedback = [];
        
        // Length check
        if (strlen($password) >= 8) {
            $score += 25;
        } elseif (strlen($password) >= 6) {
            $score += 15;
            $feedback[] = "Use at least 8 characters for better security";
        } else {
            $feedback[] = "Password must be at least 6 characters long";
        }
        
        // Character variety checks
        if (preg_match('/[a-z]/', $password)) {
            $score += 15;
        } else {
            $feedback[] = "Add lowercase letters";
        }
        
        if (preg_match('/[A-Z]/', $password)) {
            $score += 15;
        } else {
            $feedback[] = "Add uppercase letters";
        }
        
        if (preg_match('/[0-9]/', $password)) {
            $score += 15;
        } else {
            $feedback[] = "Add numbers";
        }
        
        if (preg_match('/[^A-Za-z0-9]/', $password)) {
            $score += 15;
        } else {
            $feedback[] = "Add special characters";
        }
        
        // Determine strength level
        if ($score < 30) {
            $level = 'weak';
        } elseif ($score < 60) {
            $level = 'fair';
        } elseif ($score < 90) {
            $level = 'good';
        } else {
            $level = 'strong';
        }
        
        return [
            'score' => $score,
            'level' => $level,
            'feedback' => $feedback,
            'isValid' => strlen($password) >= 6
        ];
    }
    
    /**
     * Generate random password
     */
    public static function generate($length = 12) {
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        return $password;
    }
    
    /**
     * Generate secure random token
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
}
?>
