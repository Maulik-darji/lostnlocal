<?php
/**
 * JWT Token Management for LostnLocal
 * Simple JWT implementation for PHP
 */

class JWT {
    private static $secret;
    
    public static function init() {
        self::$secret = JWT_SECRET;
    }
    
    /**
     * Generate JWT token
     */
    public static function generate($payload) {
        self::init();
        
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRES_IN;
        $payload = json_encode($payload);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    /**
     * Verify JWT token
     */
    public static function verify($token) {
        self::init();
        
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            return false;
        }
        
        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[2]));
        
        $expectedSignature = hash_hmac('sha256', $tokenParts[0] . "." . $tokenParts[1], self::$secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }
        
        $payloadData = json_decode($payload, true);
        
        // Check expiration
        if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    /**
     * Get user ID from token
     */
    public static function getUserId($token) {
        $payload = self::verify($token);
        return $payload ? $payload['user_id'] : null;
    }
    
    /**
     * Refresh token
     */
    public static function refresh($token) {
        $payload = self::verify($token);
        if (!$payload) {
            return false;
        }
        
        // Remove iat and exp from payload
        unset($payload['iat']);
        unset($payload['exp']);
        
        return self::generate($payload);
    }
}

// Initialize JWT
JWT::init();
?>
