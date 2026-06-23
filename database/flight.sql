DROP DATABASE IF EXISTS flight_booking;
CREATE DATABASE flight_booking;
USE flight_booking;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(10),
    otp_expiry DATETIME,
    seat_preference VARCHAR(50) DEFAULT 'Any',
    meal_preference VARCHAR(50) DEFAULT 'Any',
    profile_picture LONGTEXT
);

CREATE TABLE airports (
    code VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE flights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    airline VARCHAR(50) NOT NULL,
    origin_code VARCHAR(10),
    destination_code VARCHAR(10),
    departure_time DATETIME,
    arrival_time DATETIME,
    price DECIMAL(10,2),
    FOREIGN KEY (origin_code) REFERENCES airports(code),
    FOREIGN KEY (destination_code) REFERENCES airports(code)
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    flight_id INT,
    seat VARCHAR(10),
    seat_number VARCHAR(10),
    status VARCHAR(20) DEFAULT 'confirmed',
    reminder_sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flight_id) REFERENCES flights(id)
);

-- Admin
INSERT INTO users (username, password, email, role, is_verified) VALUES
('admin', 'admin123', 'admin@flightbooking.com', 'admin', TRUE);

-- Airports
INSERT INTO airports (code, city, name) VALUES
('JFK', 'New York',   'John F. Kennedy International'),
('LHR', 'London',     'Heathrow'),
('CDG', 'Paris',      'Charles de Gaulle'),
('DXB', 'Dubai',      'Dubai International'),
('HND', 'Tokyo',      'Haneda'),
('SYD', 'Sydney',     'Sydney Airport'),
('SIN', 'Singapore',  'Changi'),
('FRA', 'Frankfurt',  'Frankfurt Airport'),
('PEK', 'Beijing',    'Beijing Capital International');

-- ═══════════════════════════════════════════════════════════
-- DIRECT FLIGHTS — 2026-07-05
-- Connecting logic: leg2.dep > leg1.arr + 45min, < +8hr
-- ═══════════════════════════════════════════════════════════

INSERT INTO flights (flight_number, airline, origin_code, destination_code, departure_time, arrival_time, price) VALUES

-- ── JFK → LHR (direct, ~7h) ──
('BA101', 'British Airways',   'JFK', 'LHR', '2026-07-05 00:00:00', '2026-07-05 07:00:00', 520.00),
('VS150', 'Virgin Atlantic',   'JFK', 'LHR', '2026-07-05 06:00:00', '2026-07-05 13:00:00', 490.00),
('DL388', 'Delta',             'JFK', 'LHR', '2026-07-05 12:00:00', '2026-07-05 19:00:00', 610.00),
('AA200', 'American Airlines', 'JFK', 'LHR', '2026-07-05 18:00:00', '2026-07-06 01:00:00', 310.00),

-- ── LHR → JFK (direct, ~8h) ──
('BA102', 'British Airways',   'LHR', 'JFK', '2026-07-05 09:00:00', '2026-07-05 12:00:00', 550.00),
('VS151', 'Virgin Atlantic',   'LHR', 'JFK', '2026-07-05 14:00:00', '2026-07-05 17:00:00', 510.00),

-- ── JFK → CDG (direct, ~7h) ──
('AF301', 'Air France',        'JFK', 'CDG', '2026-07-05 01:00:00', '2026-07-05 08:00:00', 430.00),
('DL302', 'Delta',             'JFK', 'CDG', '2026-07-05 14:00:00', '2026-07-05 21:00:00', 400.00),

-- ── CDG → JFK (direct, ~8h) ──
('AF302', 'Air France',        'CDG', 'JFK', '2026-07-05 10:00:00', '2026-07-05 13:00:00', 450.00),
('UA303', 'United Airlines',   'CDG', 'JFK', '2026-07-05 16:00:00', '2026-07-05 19:00:00', 420.00),

-- ── JFK → DXB (direct, ~12h) ──
('EK211', 'Emirates',          'JFK', 'DXB', '2026-07-05 00:00:00', '2026-07-05 12:00:00', 580.00),
('QR212', 'Qatar Airways',     'JFK', 'DXB', '2026-07-05 06:00:00', '2026-07-05 18:00:00', 560.00),

-- ── DXB → JFK (direct, ~14h) ──
('EK213', 'Emirates',          'DXB', 'JFK', '2026-07-05 02:00:00', '2026-07-05 08:00:00', 590.00),
('QR214', 'Qatar Airways',     'DXB', 'JFK', '2026-07-05 14:00:00', '2026-07-05 20:00:00', 570.00),

-- ── LHR → DXB (direct, ~7h) ──
('EK001', 'Emirates',          'LHR', 'DXB', '2026-07-05 06:00:00', '2026-07-05 13:00:00', 480.00),
('BA107', 'British Airways',   'LHR', 'DXB', '2026-07-05 14:00:00', '2026-07-05 21:00:00', 500.00),

-- ── DXB → LHR (direct, ~7h) ──
('EK002', 'Emirates',          'DXB', 'LHR', '2026-07-05 02:00:00', '2026-07-05 09:00:00', 490.00),
('FZ003', 'flydubai',          'DXB', 'LHR', '2026-07-05 10:00:00', '2026-07-05 17:00:00', 350.00),

-- ── DXB → SIN (direct, ~7h) ──
('EK401', 'Emirates',          'DXB', 'SIN', '2026-07-05 02:00:00', '2026-07-05 09:00:00', 420.00),
('SQ402', 'Singapore Airlines','DXB', 'SIN', '2026-07-05 14:00:00', '2026-07-05 21:00:00', 390.00),

-- ── SIN → DXB (direct, ~7h) ──
('EK402', 'Emirates',          'SIN', 'DXB', '2026-07-05 01:00:00', '2026-07-05 08:00:00', 410.00),
('SQ403', 'Singapore Airlines','SIN', 'DXB', '2026-07-05 10:00:00', '2026-07-05 17:00:00', 380.00),

-- ── DXB → SYD (direct, ~14h) ──
('EK414', 'Emirates',          'DXB', 'SYD', '2026-07-05 14:30:00', '2026-07-06 04:30:00', 760.00),
('QF415', 'Qantas',            'DXB', 'SYD', '2026-07-05 20:00:00', '2026-07-06 10:00:00', 730.00),

-- ── SYD → DXB (direct, ~14h) ──
('EK413', 'Emirates',          'SYD', 'DXB', '2026-07-05 06:00:00', '2026-07-05 20:00:00', 750.00),
('QF414', 'Qantas',            'SYD', 'DXB', '2026-07-05 14:00:00', '2026-07-06 04:00:00', 720.00),

-- ── SIN → SYD (direct, ~8h) ──
('SQ211', 'Singapore Airlines','SIN', 'SYD', '2026-07-05 08:00:00', '2026-07-05 16:00:00', 460.00),
('QF212', 'Qantas',            'SIN', 'SYD', '2026-07-05 18:00:00', '2026-07-06 02:00:00', 430.00),

-- ── SYD → SIN (direct, ~8h) ──
('SQ212', 'Singapore Airlines','SYD', 'SIN', '2026-07-05 07:00:00', '2026-07-05 15:00:00', 450.00),
('QF213', 'Qantas',            'SYD', 'SIN', '2026-07-05 19:00:00', '2026-07-06 03:00:00', 420.00),

-- ── SIN → HND (direct, ~7h) ──
('SQ011', 'Singapore Airlines','SIN', 'HND', '2026-07-05 01:00:00', '2026-07-05 08:00:00', 510.00),
('NH012', 'ANA',               'SIN', 'HND', '2026-07-05 10:00:00', '2026-07-05 17:00:00', 480.00),

-- ── HND → SIN (direct, ~7h) ──
('SQ012', 'Singapore Airlines','HND', 'SIN', '2026-07-05 09:00:00', '2026-07-05 16:00:00', 500.00),
('JL013', 'Japan Airlines',    'HND', 'SIN', '2026-07-05 18:00:00', '2026-07-06 01:00:00', 460.00),

-- ── HND → PEK (direct, ~3h) ──
('CA001', 'Air China',         'HND', 'PEK', '2026-07-05 08:00:00', '2026-07-05 11:00:00', 220.00),
('NH002', 'ANA',               'HND', 'PEK', '2026-07-05 15:00:00', '2026-07-05 18:00:00', 240.00),

-- ── PEK → HND (direct, ~3h) ──
('CA002', 'Air China',         'PEK', 'HND', '2026-07-05 07:00:00', '2026-07-05 10:00:00', 230.00),
('CZ003', 'China Southern',    'PEK', 'HND', '2026-07-05 14:00:00', '2026-07-05 17:00:00', 210.00),

-- ── FRA → CDG (direct, ~1.5h) ──
('LH501', 'Lufthansa',         'FRA', 'CDG', '2026-07-05 07:00:00', '2026-07-05 08:30:00', 120.00),
('AF502', 'Air France',        'FRA', 'CDG', '2026-07-05 14:00:00', '2026-07-05 15:30:00', 110.00),

-- ── CDG → FRA (direct, ~1.5h) ──
('LH503', 'Lufthansa',         'CDG', 'FRA', '2026-07-05 10:00:00', '2026-07-05 11:30:00', 115.00),
('AF504', 'Air France',        'CDG', 'FRA', '2026-07-05 17:00:00', '2026-07-05 18:30:00', 105.00),

-- ── FRA → DXB (direct, ~6h) ──
('LH601', 'Lufthansa',         'FRA', 'DXB', '2026-07-05 06:00:00', '2026-07-05 12:00:00', 370.00),
('EK602', 'Emirates',          'FRA', 'DXB', '2026-07-05 14:00:00', '2026-07-05 20:00:00', 350.00),

-- ── DXB → FRA (direct, ~6h) ──
('LH603', 'Lufthansa',         'DXB', 'FRA', '2026-07-05 02:00:00', '2026-07-05 08:00:00', 360.00),
('EK604', 'Emirates',          'DXB', 'FRA', '2026-07-05 14:00:00', '2026-07-05 20:00:00', 340.00),

-- ── PEK → LHR (direct, ~10h) ──
('BA071', 'British Airways',   'PEK', 'LHR', '2026-07-05 01:00:00', '2026-07-05 11:00:00', 680.00),
('CA072', 'Air China',         'PEK', 'LHR', '2026-07-05 13:00:00', '2026-07-05 23:00:00', 650.00),

-- ── LHR → PEK (direct, ~10h) ──
('BA073', 'British Airways',   'LHR', 'PEK', '2026-07-05 01:00:00', '2026-07-05 11:00:00', 670.00),
('CA074', 'Air China',         'LHR', 'PEK', '2026-07-05 13:00:00', '2026-07-05 23:00:00', 640.00),

-- ── LHR → SIN (direct, ~13h) ──
('SQ301', 'Singapore Airlines','LHR', 'SIN', '2026-07-05 01:00:00', '2026-07-05 14:00:00', 550.00),
('BA302', 'British Airways',   'LHR', 'SIN', '2026-07-05 10:00:00', '2026-07-05 23:00:00', 530.00),

-- ── SIN → LHR (direct, ~13h) ──
('SQ303', 'Singapore Airlines','SIN', 'LHR', '2026-07-05 01:00:00', '2026-07-05 14:00:00', 540.00),
('BA304', 'British Airways',   'SIN', 'LHR', '2026-07-05 12:00:00', '2026-07-06 01:00:00', 520.00),

-- ── CDG → DXB (direct, ~6h) ──
('AF701', 'Air France',        'CDG', 'DXB', '2026-07-05 07:00:00', '2026-07-05 13:00:00', 400.00),
('EK702', 'Emirates',          'CDG', 'DXB', '2026-07-05 15:00:00', '2026-07-05 21:00:00', 380.00),

-- ── DXB → CDG (direct, ~6h) ──
('AF703', 'Air France',        'DXB', 'CDG', '2026-07-05 02:00:00', '2026-07-05 08:00:00', 390.00),
('EK704', 'Emirates',          'DXB', 'CDG', '2026-07-05 14:00:00', '2026-07-05 20:00:00', 370.00),

-- ── FRA → SIN (direct, ~12h) ──
('LH801', 'Lufthansa',         'FRA', 'SIN', '2026-07-05 01:00:00', '2026-07-05 13:00:00', 560.00),
('SQ802', 'Singapore Airlines','FRA', 'SIN', '2026-07-05 10:00:00', '2026-07-05 22:00:00', 540.00),

-- ── SIN → FRA (direct, ~12h) ──
('LH803', 'Lufthansa',         'SIN', 'FRA', '2026-07-05 01:00:00', '2026-07-05 13:00:00', 550.00),
('SQ804', 'Singapore Airlines','SIN', 'FRA', '2026-07-05 12:00:00', '2026-07-06 00:00:00', 530.00);

-- ═══════════════════════════════════════════════════════════
-- CONNECTING ROUTES — verified chains (leg2.dep = leg1.arr + 2~4h)
-- Example chains:
--   JFK → DXB (arr 12:00) → SIN (dep 14:00, arr 21:00)  ✅ 2h layover
--   JFK → DXB (arr 12:00) → SYD (dep 14:30, arr +1day)  ✅ 2.5h layover
--   JFK → LHR (arr 07:00) → DXB (dep 14:00, arr 21:00)  ✅ 7h layover (within 8h limit)
--   JFK → LHR (arr 07:00) → SIN (dep 10:00, arr 23:00)  ✅ 3h layover
--   JFK → CDG (arr 08:00) → DXB (dep 15:00, arr 21:00)  ✅ 7h layover
--   LHR → DXB (arr 13:00) → SIN (dep 14:00, arr 21:00)  ✅ 1h layover (>45min)
--   LHR → DXB (arr 13:00) → SYD (dep 14:30, arr +1day)  ✅ 1.5h layover
--   DXB → SIN (arr 09:00) → SYD (dep 18:00, arr +1day)  ✅ wait within 8h — but SIN→SYD dep 08:00 is too early
--   DXB → SIN (arr 21:00) → SYD next: use QF212 dep 18:00 — NO, too early
--   Use SQ211 dep 08:00 next day — outside date range
--   FRA → DXB (arr 12:00) → SIN (dep 14:00, arr 21:00)  ✅
--   FRA → DXB (arr 12:00) → SYD (dep 14:30, arr +1day)  ✅
--   PEK → HND (arr 10:00) → SIN (dep 10:00) — only 0min, too short
--   Use NH012 dep 10:00 — NO, need >45min after 10:00
--   Use JL013 dep 18:00 ✅ 8h layover — exactly at limit, skip
--   CDG → FRA (arr 11:30) → DXB (dep 14:00, arr 20:00) ✅ 2.5h layover
-- ═══════════════════════════════════════════════════════════


USE flight_booking;

-- ═══════════════════════════════════════════════════════════
-- ADDITIONAL DATES — July 2026
-- Same routes, different dates
-- ═══════════════════════════════════════════════════════════

INSERT INTO flights (flight_number, airline, origin_code, destination_code, departure_time, arrival_time, price) VALUES

-- ── July 6 ──
('BA101B', 'British Airways',   'JFK', 'LHR', '2026-07-06 00:00:00', '2026-07-06 07:00:00', 535.00),
('EK211B', 'Emirates',          'JFK', 'DXB', '2026-07-06 00:00:00', '2026-07-06 12:00:00', 595.00),
('EK001B', 'Emirates',          'LHR', 'DXB', '2026-07-06 06:00:00', '2026-07-06 13:00:00', 490.00),
('EK401B', 'Emirates',          'DXB', 'SIN', '2026-07-06 14:00:00', '2026-07-06 21:00:00', 430.00),
('SQ211B', 'Singapore Airlines','SIN', 'SYD', '2026-07-06 08:00:00', '2026-07-06 16:00:00', 470.00),
('AF301B', 'Air France',        'JFK', 'CDG', '2026-07-06 01:00:00', '2026-07-06 08:00:00', 445.00),
('LH601B', 'Lufthansa',         'FRA', 'DXB', '2026-07-06 06:00:00', '2026-07-06 12:00:00', 380.00),
('BA102B', 'British Airways',   'LHR', 'JFK', '2026-07-06 09:00:00', '2026-07-06 12:00:00', 560.00),
('SQ012B', 'Singapore Airlines','HND', 'SIN', '2026-07-06 09:00:00', '2026-07-06 16:00:00', 510.00),
('EK414B', 'Emirates',          'DXB', 'SYD', '2026-07-06 14:30:00', '2026-07-07 04:30:00', 775.00),

-- ── July 7 ──
('BA101C', 'British Airways',   'JFK', 'LHR', '2026-07-07 06:00:00', '2026-07-07 13:00:00', 510.00),
('QR212B', 'Qatar Airways',     'JFK', 'DXB', '2026-07-07 06:00:00', '2026-07-07 18:00:00', 570.00),
('EK001C', 'Emirates',          'LHR', 'DXB', '2026-07-07 14:00:00', '2026-07-07 21:00:00', 495.00),
('SQ402B', 'Singapore Airlines','DXB', 'SIN', '2026-07-07 14:00:00', '2026-07-07 21:00:00', 400.00),
('QF212B', 'Qantas',            'SIN', 'SYD', '2026-07-07 18:00:00', '2026-07-08 02:00:00', 440.00),
('DL302B', 'Delta',             'JFK', 'CDG', '2026-07-07 14:00:00', '2026-07-07 21:00:00', 415.00),
('EK602B', 'Emirates',          'FRA', 'DXB', '2026-07-07 14:00:00', '2026-07-07 20:00:00', 360.00),
('VS151B', 'Virgin Atlantic',   'LHR', 'JFK', '2026-07-07 14:00:00', '2026-07-07 17:00:00', 520.00),
('CA001B', 'Air China',         'HND', 'PEK', '2026-07-07 08:00:00', '2026-07-07 11:00:00', 225.00),
('EK413B', 'Emirates',          'SYD', 'DXB', '2026-07-07 06:00:00', '2026-07-07 20:00:00', 760.00),

-- ── July 8 ──
('DL388B', 'Delta',             'JFK', 'LHR', '2026-07-08 12:00:00', '2026-07-08 19:00:00', 620.00),
('EK211C', 'Emirates',          'JFK', 'DXB', '2026-07-08 00:00:00', '2026-07-08 12:00:00', 585.00),
('BA107B', 'British Airways',   'LHR', 'DXB', '2026-07-08 14:00:00', '2026-07-08 21:00:00', 510.00),
('EK401C', 'Emirates',          'DXB', 'SIN', '2026-07-08 02:00:00', '2026-07-08 09:00:00', 425.00),
('SQ211C', 'Singapore Airlines','SIN', 'SYD', '2026-07-08 18:00:00', '2026-07-09 02:00:00', 445.00),
('AF302B', 'Air France',        'CDG', 'JFK', '2026-07-08 10:00:00', '2026-07-08 13:00:00', 455.00),
('LH501B', 'Lufthansa',         'FRA', 'CDG', '2026-07-08 07:00:00', '2026-07-08 08:30:00', 125.00),
('NH012B', 'ANA',               'SIN', 'HND', '2026-07-08 10:00:00', '2026-07-08 17:00:00', 490.00),
('CA072B', 'Air China',         'PEK', 'LHR', '2026-07-08 13:00:00', '2026-07-08 23:00:00', 660.00),
('QF415B', 'Qantas',            'DXB', 'SYD', '2026-07-08 20:00:00', '2026-07-09 10:00:00', 740.00),

-- ── July 10 ──
('AA200B', 'American Airlines', 'JFK', 'LHR', '2026-07-10 18:00:00', '2026-07-11 01:00:00', 320.00),
('EK211D', 'Emirates',          'JFK', 'DXB', '2026-07-10 06:00:00', '2026-07-10 18:00:00', 590.00),
('EK001D', 'Emirates',          'LHR', 'DXB', '2026-07-10 06:00:00', '2026-07-10 13:00:00', 485.00),
('SQ402C', 'Singapore Airlines','DXB', 'SIN', '2026-07-10 14:00:00', '2026-07-10 21:00:00', 395.00),
('SQ211D', 'Singapore Airlines','SIN', 'SYD', '2026-07-10 08:00:00', '2026-07-10 16:00:00', 460.00),
('UA303B', 'United Airlines',   'CDG', 'JFK', '2026-07-10 16:00:00', '2026-07-10 19:00:00', 430.00),
('AF701B', 'Air France',        'CDG', 'DXB', '2026-07-10 07:00:00', '2026-07-10 13:00:00', 410.00),
('SQ011B', 'Singapore Airlines','SIN', 'HND', '2026-07-10 01:00:00', '2026-07-10 08:00:00', 515.00),
('BA071B', 'British Airways',   'PEK', 'LHR', '2026-07-10 01:00:00', '2026-07-10 11:00:00', 690.00),
('EK414C', 'Emirates',          'DXB', 'SYD', '2026-07-10 20:00:00', '2026-07-11 10:00:00', 765.00),

-- ── July 12 ──
('VS150B', 'Virgin Atlantic',   'JFK', 'LHR', '2026-07-12 06:00:00', '2026-07-12 13:00:00', 495.00),
('QR212C', 'Qatar Airways',     'JFK', 'DXB', '2026-07-12 06:00:00', '2026-07-12 18:00:00', 565.00),
('FZ003B', 'flydubai',          'DXB', 'LHR', '2026-07-12 10:00:00', '2026-07-12 17:00:00', 355.00),
('EK401D', 'Emirates',          'DXB', 'SIN', '2026-07-12 14:00:00', '2026-07-12 21:00:00', 420.00),
('QF212C', 'Qantas',            'SIN', 'SYD', '2026-07-12 18:00:00', '2026-07-13 02:00:00', 435.00),
('AF301C', 'Air France',        'JFK', 'CDG', '2026-07-12 01:00:00', '2026-07-12 08:00:00', 440.00),
('LH601C', 'Lufthansa',         'FRA', 'DXB', '2026-07-12 06:00:00', '2026-07-12 12:00:00', 375.00),
('JL013B', 'Japan Airlines',    'HND', 'SIN', '2026-07-12 18:00:00', '2026-07-13 01:00:00', 465.00),
('CA074B', 'Air China',         'LHR', 'PEK', '2026-07-12 13:00:00', '2026-07-12 23:00:00', 645.00),
('QF414B', 'Qantas',            'SYD', 'DXB', '2026-07-12 14:00:00', '2026-07-13 04:00:00', 725.00),

-- ── July 15 ──
('BA101D', 'British Airways',   'JFK', 'LHR', '2026-07-15 00:00:00', '2026-07-15 07:00:00', 525.00),
('EK211E', 'Emirates',          'JFK', 'DXB', '2026-07-15 00:00:00', '2026-07-15 12:00:00', 580.00),
('EK001E', 'Emirates',          'LHR', 'DXB', '2026-07-15 06:00:00', '2026-07-15 13:00:00', 488.00),
('EK401E', 'Emirates',          'DXB', 'SIN', '2026-07-15 14:00:00', '2026-07-15 21:00:00', 428.00),
('SQ211E', 'Singapore Airlines','SIN', 'SYD', '2026-07-15 08:00:00', '2026-07-15 16:00:00', 462.00),
('DL302C', 'Delta',             'JFK', 'CDG', '2026-07-15 14:00:00', '2026-07-15 21:00:00', 405.00),
('EK602C', 'Emirates',          'FRA', 'DXB', '2026-07-15 14:00:00', '2026-07-15 20:00:00', 355.00),
('SQ012C', 'Singapore Airlines','HND', 'SIN', '2026-07-15 09:00:00', '2026-07-15 16:00:00', 505.00),
('BA073B', 'British Airways',   'LHR', 'PEK', '2026-07-15 01:00:00', '2026-07-15 11:00:00', 672.00),
('EK414D', 'Emirates',          'DXB', 'SYD', '2026-07-15 14:30:00', '2026-07-16 04:30:00', 762.00),

-- ── July 20 ──
('AA200C', 'American Airlines', 'JFK', 'LHR', '2026-07-20 18:00:00', '2026-07-21 01:00:00', 315.00),
('EK211F', 'Emirates',          'JFK', 'DXB', '2026-07-20 00:00:00', '2026-07-20 12:00:00', 582.00),
('BA107C', 'British Airways',   'LHR', 'DXB', '2026-07-20 14:00:00', '2026-07-20 21:00:00', 505.00),
('SQ402D', 'Singapore Airlines','DXB', 'SIN', '2026-07-20 14:00:00', '2026-07-20 21:00:00', 392.00),
('QF212D', 'Qantas',            'SIN', 'SYD', '2026-07-20 18:00:00', '2026-07-21 02:00:00', 432.00),
('AF302C', 'Air France',        'CDG', 'JFK', '2026-07-20 10:00:00', '2026-07-20 13:00:00', 452.00),
('LH601D', 'Lufthansa',         'FRA', 'DXB', '2026-07-20 06:00:00', '2026-07-20 12:00:00', 372.00),
('NH012C', 'ANA',               'SIN', 'HND', '2026-07-20 10:00:00', '2026-07-20 17:00:00', 485.00),
('EK413C', 'Emirates',          'SYD', 'DXB', '2026-07-20 06:00:00', '2026-07-20 20:00:00', 755.00),
('QF415C', 'Qantas',            'DXB', 'SYD', '2026-07-20 20:00:00', '2026-07-21 10:00:00', 735.00);