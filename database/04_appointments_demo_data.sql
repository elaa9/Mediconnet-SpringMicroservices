-- =====================================================================
-- MediConnect - Demo Data Script
-- Script 04: Appointment Service demo data
-- Target database: mediconnect_appointments_db
-- =====================================================================
-- IMPORTANT: Run AFTER scripts 02 and 03 so the patient/doctor IDs match.
-- IDs 1-7 for patients (from script 02), IDs 1-7 for doctors (from script 03).
-- =====================================================================

USE mediconnect_appointments_db;

CREATE TABLE IF NOT EXISTS appointments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id       BIGINT       NOT NULL,
    doctor_id        BIGINT       NOT NULL,
    appointment_date DATE         NOT NULL,
    appointment_time TIME         NOT NULL,
    reason           TEXT,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM appointments WHERE id <= 10;

-- Note: patient_id and doctor_id are plain integers (no FK constraints to other DBs)
-- The appointment-service fetches patient/doctor names dynamically via OpenFeign

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, reason, status, created_at)
VALUES
(1, 1, 1, '2026-11-15', '09:00:00', 'Routine cardiac checkup and ECG review',         'CONFIRMED',  NOW()),
(2, 2, 6, '2026-11-16', '10:30:00', 'Diabetes management and HbA1c follow-up',         'CONFIRMED',  NOW()),
(3, 3, 1, '2026-11-17', '14:00:00', 'Shortness of breath and chest pain evaluation',   'PENDING',    NOW()),
(4, 4, 5, '2026-11-18', '11:00:00', 'Post-operative follow-up after knee replacement', 'CONFIRMED',  NOW()),
(5, 5, 4, '2026-11-19', '09:30:00', 'Vaccination and annual pediatric checkup',        'CONFIRMED',  NOW()),
(6, 6, 2, '2026-11-20', '15:00:00', 'Skin rash examination and dermatology consult',   'PENDING',    NOW()),
(7, 7, 3, '2026-11-21', '10:00:00', 'Severe migraines and neurological evaluation',    'CONFIRMED',  NOW()),
(8, 1, 6, '2026-11-10', '08:30:00', 'Blood pressure medication adjustment',            'COMPLETED',  NOW()),
(9, 2, 1, '2026-11-05', '13:00:00', 'Cardiac stress test results review',              'COMPLETED',  NOW()),
(10,3, 3, '2026-11-08', '16:00:00', 'EEG and migraine prevention treatment',           'CANCELLED',  NOW());

SELECT CONCAT('Inserted ', COUNT(*), ' demo appointments.') AS status FROM appointments;
SELECT id, patient_id, doctor_id, appointment_date, status FROM appointments ORDER BY appointment_date;
