-- =====================================================================
-- MediConnect - Demo Data Script
-- Script 05: Consultation Service demo data
-- Target database: mediconnect_consultations_db
-- =====================================================================
-- References appointment_id 8, 9 (COMPLETED appointments from script 04)
-- =====================================================================

USE mediconnect_consultations_db;

CREATE TABLE IF NOT EXISTS consultations (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id    BIGINT       NOT NULL,
    patient_id        BIGINT       NOT NULL,
    doctor_id         BIGINT       NOT NULL,
    diagnosis         TEXT,
    prescription      TEXT,
    notes             TEXT,
    consultation_date DATETIME,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM consultations WHERE id <= 10;

INSERT INTO consultations (id, appointment_id, patient_id, doctor_id, diagnosis, prescription, notes, consultation_date, created_at)
VALUES
(1, 8, 1, 6,
 'Stage 1 Hypertension — blood pressure consistently above 140/90 mmHg.',
 'Amlodipine 5mg once daily. Lifestyle modifications: low-sodium diet, 30 min aerobic exercise 5 days/week.',
 'Patient shows good compliance with previous medication. Blood pressure slightly elevated due to work stress. Follow-up in 3 months.',
 '2026-11-10 08:30:00', NOW()),

(2, 9, 2, 1,
 'Well-controlled Type 2 Diabetes. Cardiac stress test results normal — no ischemic changes detected.',
 'Continue Metformin 1000mg twice daily. Maintain current diet plan. Cardiac clearance given.',
 'Patient exercising regularly and managing weight effectively. HbA1c at 6.8% — within target range. Excellent progress.',
 '2026-11-05 13:00:00', NOW()),

(3, 7, 7, 3,
 'Chronic migraine with aura — 8+ episodes per month. Possible tension-type headache overlap.',
 'Topiramate 25mg at bedtime (titrate to 50mg after 2 weeks). Sumatriptan 50mg as needed for acute attacks. Avoid known triggers.',
 'EEG shows no epileptiform activity. Recommend migraine diary. Referral to physiotherapy for cervicogenic component. Follow-up in 6 weeks.',
 '2026-11-21 10:00:00', NOW()),

(4, 4, 4, 5,
 'Post-total knee arthroplasty — 6-week follow-up. Recovery progressing well.',
 'Continue physiotherapy 3 sessions per week. Celecoxib 200mg once daily for inflammation. Gradual weight-bearing exercises.',
 'Range of motion improving: 0-105 degrees. Wound healed without complications. X-ray shows well-seated prosthesis. Cleared for pool physiotherapy.',
 '2026-11-18 11:00:00', NOW());

SELECT CONCAT('Inserted ', COUNT(*), ' demo consultations.') AS status FROM consultations;
