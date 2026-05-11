-- Create database
CREATE DATABASE IF NOT EXISTS venuespot;
USE venuespot;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    card_number VARCHAR(255),
    card_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Owners table
CREATE TABLE IF NOT EXISTS owners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    business_name VARCHAR(100),
    address TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    venue_type VARCHAR(50) DEFAULT 'Other',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
);

-- Venue amenities table
CREATE TABLE IF NOT EXISTS venue_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    customer_id INT NOT NULL,
    event_date DATE NOT NULL,
    guests INT NOT NULL,
    event_type VARCHAR(50) DEFAULT 'Other',
    special_requests TEXT,
    total_amount DECIMAL(10,2),
    payment_card_last4 VARCHAR(4),
    payment_card_name VARCHAR(100),
    status ENUM('pending', 'confirmed', 'rejected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT IGNORE INTO owners (id, username, password, full_name, email, phone, business_name, address, description) VALUES
(1, 'owner1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Owner', 'owner@example.com', '1234567890', 'Venue Co', '123 Main St', 'Best venues');

INSERT IGNORE INTO customers (id, username, password, full_name, email, phone) VALUES
(1, 'customer1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Customer', 'customer@example.com', '0987654321');

INSERT IGNORE INTO venues (id, owner_id, name, location, capacity, price, venue_type, description) VALUES
(1, 1, 'Grand Hall', 'Downtown', 200, 5000.00, 'Hall', 'Beautiful hall for events'),
(2, 1, 'Garden Venue', 'Suburb', 100, 3000.00, 'Garden', 'Outdoor garden venue'),
(3, 1, 'Conference Room', 'City Center', 50, 2000.00, 'Room', 'Modern conference room');

INSERT IGNORE INTO venue_amenities (venue_id, amenity) VALUES
(1, 'WiFi'), (1, 'Parking'), (1, 'Catering'),
(2, 'Outdoor'), (2, 'Lighting'),
(3, 'Projector'), (3, 'Sound System');