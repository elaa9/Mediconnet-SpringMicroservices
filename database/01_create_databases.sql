-- =====================================================================
-- MediConnect - Database Initialization Script
-- Script 01: Create all independent databases
-- =====================================================================
-- Run this script first in phpMyAdmin or MySQL command line:
--   mysql -u root -p < 01_create_databases.sql
-- =====================================================================

-- Each microservice has its own independent database.
-- No cross-database foreign keys exist.
-- Services communicate via REST APIs only.

CREATE DATABASE IF NOT EXISTS mediconnect_patients_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS mediconnect_doctors_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS mediconnect_appointments_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS mediconnect_consultations_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

SELECT 'MediConnect databases created successfully.' AS message;
SELECT schema_name AS 'Database'
FROM information_schema.schemata
WHERE schema_name LIKE 'mediconnect_%';
