package com.mediconnect.patient.repository;

import com.mediconnect.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Patient repository - data access layer for the patient-service.
 * Operates exclusively on the mediconnect_patients_db database.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    List<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);

    boolean existsByEmail(String email);
}
