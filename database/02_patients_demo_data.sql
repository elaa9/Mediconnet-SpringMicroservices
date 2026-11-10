-- =====================================================================
-- MediConnect - Demo Data Script
-- Script 02: Patient Service demo data
-- Target database: mediconnect_patients_db
-- =====================================================================
-- Run AFTER starting the patient-service (Hibernate will create the table).
-- Or run manually after creating the table schema below.
-- =====================================================================

USE mediconnect_patients_db;

-- Create table (Hibernate handles this automatically, but included for reference)
CREATE TABLE IF NOT EXISTS patients (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    phone           VARCHAR(20),
    date_of_birth   DATE,
    gender          VARCHAR(10),
    address         TEXT,
    medical_history TEXT,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clear existing demo data
DELETE FROM patients WHERE id <= 10;

-- Insert demo patients (fictional data only)
INSERT INTO patients (id, first_name, last_name, email, phone, date_of_birth, gender, address, medical_history, created_at)
VALUES
(1, 'Alice',   'Martin',   'alice.martin@example.com',   '+212600111001', '1985-03-15', 'Female', '12 Rue Hassan II, Rabat',          'Hypertension (diagnosed 2018), Penicillin allergy',           NOW()),
(2, 'Bob',     'Dupont',   'bob.dupont@example.com',     '+212600111002', '1990-07-22', 'Male',   '45 Avenue Mohammed V, Casablanca', 'Type 2 Diabetes (diagnosed 2020)',                           NOW()),
(3, 'Camille', 'Leclerc',  'camille.leclerc@example.com','+212600111003', '1978-11-08', 'Female', '8 Boulevard Zerktouni, Marrakech', 'Asthma since childhood, Ibuprofen allergy',                  NOW()),
(4, 'David',   'Bernard',  'david.bernard@example.com',  '+212600111004', '1965-05-30', 'Male',   '23 Rue Allal Ben Abdallah, Fes',   'Coronary artery disease, Post-bypass surgery 2019',          NOW()),
(5, 'Emma',    'Moreau',   'emma.moreau@example.com',    '+212600111005', '2000-09-14', 'Female', '67 Rue Ibn Sina, Meknes',          'No significant medical history',                             NOW()),
(6, 'Fatima',  'Alaoui',   'fatima.alaoui@example.com',  '+212600111006', '1972-01-25', 'Female', '15 Avenue Hassan II, Agadir',      'Hypothyroidism, on Levothyroxine',                           NOW()),
(7, 'Hamid',   'Benali',   'hamid.benali@example.com',   '+212600111007', '1988-08-19', 'Male',   '90 Rue Moulay Ismail, Oujda',      'Chronic lower back pain, mild obesity',                      NOW());

SELECT CONCAT('Inserted ', COUNT(*), ' demo patients.') AS status FROM patients;
