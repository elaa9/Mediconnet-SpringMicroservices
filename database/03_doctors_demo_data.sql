-- =====================================================================
-- MediConnect - Demo Data Script
-- Script 03: Doctor Service demo data
-- Target database: mediconnect_doctors_db
-- =====================================================================

USE mediconnect_doctors_db;

CREATE TABLE IF NOT EXISTS doctors (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name         VARCHAR(50)    NOT NULL,
    last_name          VARCHAR(50)    NOT NULL,
    email              VARCHAR(100)   NOT NULL UNIQUE,
    phone              VARCHAR(20),
    specialization     VARCHAR(100)   NOT NULL,
    experience_years   INT,
    description        TEXT,
    consultation_price DECIMAL(10, 2),
    available          TINYINT(1)     NOT NULL DEFAULT 1,
    created_at         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM doctors WHERE id <= 10;

INSERT INTO doctors (id, first_name, last_name, email, phone, specialization, experience_years, description, consultation_price, available, created_at)
VALUES
(1, 'Youssef',  'El Idrissi', 'youssef.elidrissi@mediconnect.com', '+212661001001', 'Cardiology',      15, 'Board-certified cardiologist specializing in interventional cardiology and heart failure management.',          350.00, 1, NOW()),
(2, 'Nadia',    'Benhaddou',  'nadia.benhaddou@mediconnect.com',   '+212661001002', 'Dermatology',      8, 'Specialist in medical and cosmetic dermatology with expertise in skin cancer detection.',                     200.00, 1, NOW()),
(3, 'Karim',    'Mansouri',   'karim.mansouri@mediconnect.com',    '+212661001003', 'Neurology',       12, 'Neurologist with focus on epilepsy, migraines, and neurodegenerative diseases.',                            400.00, 1, NOW()),
(4, 'Leila',    'Tazi',       'leila.tazi@mediconnect.com',        '+212661001004', 'Pediatrics',       6, 'Dedicated pediatrician providing comprehensive care for infants, children, and adolescents.',               180.00, 1, NOW()),
(5, 'Omar',     'Cherkaoui',  'omar.cherkaoui@mediconnect.com',    '+212661001005', 'Orthopedics',     20, 'Senior orthopedic surgeon specializing in joint replacement and sports medicine injuries.',                 500.00, 1, NOW()),
(6, 'Samira',   'Belkadi',    'samira.belkadi@mediconnect.com',    '+212661001006', 'Endocrinology',    9, 'Endocrinologist managing diabetes, thyroid disorders, and hormonal imbalances.',                            300.00, 1, NOW()),
(7, 'Rachid',   'Fassi',      'rachid.fassi@mediconnect.com',      '+212661001007', 'Ophthalmology',   11, 'Ophthalmologist specializing in cataract surgery, glaucoma, and laser vision correction.',                  250.00, 0, NOW());

-- Note: Doctor ID 7 (Rachid Fassi) is marked as NOT available (available=0)
-- This is useful for demonstrating the "doctor not available" validation.

SELECT CONCAT('Inserted ', COUNT(*), ' demo doctors.') AS status FROM doctors;
SELECT id, CONCAT(first_name, ' ', last_name) AS name, specialization, available FROM doctors;
