-- LostnLocal Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS lostnlocal_db;
USE lostnlocal_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_uid (uid)
);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- Hidden gems table
CREATE TABLE IF NOT EXISTS hidden_gems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('nature', 'cultural', 'adventure', 'food', 'other') NOT NULL,
    submitted_by INT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_approved (approved),
    INDEX idx_submitted_by (submitted_by)
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    category ENUM('landmarks', 'nature', 'cultural', 'adventure') NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    cost_level ENUM('$', '$$', '$$$') DEFAULT '$',
    coordinates_lat DECIMAL(10, 8) DEFAULT 0.0,
    coordinates_lng DECIMAL(11, 8) DEFAULT 0.0,
    booking_price DECIMAL(10, 2) NULL,
    booking_link VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_country (country),
    INDEX idx_city (city),
    INDEX idx_category (category),
    INDEX idx_rating (rating)
);

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type ENUM('hotel', 'resort', 'hostel', 'apartment', 'villa') NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    price_per_night DECIMAL(10, 2) NOT NULL,
    amenities TEXT NULL, -- JSON string of amenities array
    booking_link VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_type (type),
    INDEX idx_rating (rating),
    INDEX idx_price (price_per_night)
);

-- Cultural insights table
CREATE TABLE IF NOT EXISTS cultural_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_destination (destination)
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_user_id (user_id)
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt with salt rounds 10
INSERT INTO users (uid, name, email, password, is_admin) VALUES 
('admin_001', 'Admin User', 'admin@lostnlocal.com', '$2b$10$rQZ8K9mN2pL3vXwYzA1bCeFgH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3a', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample destinations
INSERT INTO destinations (name, country, city, category, description, image_url, rating, cost_level, booking_price, booking_link) VALUES
('Eiffel Tower', 'France', 'Paris', 'landmarks', 'Iconic iron lattice tower and symbol of Paris', 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.8, '$$', 25.00, 'https://www.toureiffel.paris/en'),
('Machu Picchu', 'Peru', 'Cusco', 'cultural', 'Ancient Incan citadel high in the Andes Mountains', 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.9, '$$$', 65.00, 'https://www.machupicchu.gob.pe'),
('Santorini Sunset', 'Greece', 'Santorini', 'nature', 'Breathtaking sunset views over the Aegean Sea', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.7, '$$', 0.00, NULL),
('Tokyo Skytree', 'Japan', 'Tokyo', 'landmarks', 'Modern broadcasting tower with panoramic city views', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.6, '$$', 20.00, 'https://www.tokyo-skytree.jp/en'),
('Grand Canyon', 'United States', 'Arizona', 'nature', 'Massive gorge carved by the Colorado River', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.8, '$', 35.00, 'https://www.nps.gov/grca');

-- Insert sample hotels
INSERT INTO hotels (name, location, type, description, image_url, rating, price_per_night, amenities, booking_link) VALUES
('Hotel Plaza Paris', 'Paris, France', 'hotel', 'Luxury hotel in the heart of Paris with stunning city views', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.5, 250.00, '["WiFi", "Pool", "Gym", "Restaurant", "Spa"]', 'https://booking.com/hotel-plaza-paris'),
('Mountain Lodge Peru', 'Cusco, Peru', 'hotel', 'Traditional lodge near Machu Picchu with authentic Peruvian hospitality', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.3, 120.00, '["WiFi", "Restaurant", "Tour Desk"]', 'https://booking.com/mountain-lodge-peru'),
('Santorini Sunset Villa', 'Santorini, Greece', 'villa', 'Private villa with infinity pool overlooking the caldera', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.8, 400.00, '["WiFi", "Pool", "Kitchen", "Balcony"]', 'https://booking.com/santorini-sunset-villa'),
('Tokyo Business Hotel', 'Tokyo, Japan', 'hotel', 'Modern business hotel with excellent transport connections', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.2, 180.00, '["WiFi", "Gym", "Restaurant", "Concierge"]', 'https://booking.com/tokyo-business-hotel'),
('Grand Canyon Lodge', 'Arizona, USA', 'hotel', 'Rustic lodge with direct access to Grand Canyon trails', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 4.4, 150.00, '["WiFi", "Restaurant", "Gift Shop", "Tour Desk"]', 'https://booking.com/grand-canyon-lodge');

-- Insert sample cultural insights
INSERT INTO cultural_insights (title, description, destination, icon) VALUES
('Tea Ceremony Tradition', 'Experience the ancient Japanese tea ceremony and learn about its spiritual significance', 'Japan', 'fas fa-leaf'),
('Flamenco Dancing', 'Discover the passionate art of flamenco dancing in its birthplace', 'Spain', 'fas fa-music'),
('Temple Etiquette', 'Learn proper behavior when visiting Buddhist temples and shrines', 'Thailand', 'fas fa-temple-buddhist'),
('Gelato Culture', 'Explore the art of Italian gelato making and tasting traditions', 'Italy', 'fas fa-ice-cream'),
('Siesta Tradition', 'Understand the Spanish siesta culture and its impact on daily life', 'Spain', 'fas fa-bed');

-- Create indexes for better performance
CREATE INDEX idx_users_email_active ON users(email, is_active);
CREATE INDEX idx_sessions_active ON user_sessions(is_active, expires_at);
CREATE INDEX idx_hidden_gems_pending ON hidden_gems(approved, created_at);
