package com.mediconnect.doctor.repository;

import com.mediconnect.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Doctor repository - data access layer for the doctor-service.
 * Operates exclusively on the mediconnect_doctors_db database.
 */
@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmailIgnoreCase(String email);

    List<Doctor> findBySpecializationIgnoreCase(String specialization);

    List<Doctor> findByAvailableTrue();

    List<Doctor> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName);

    boolean existsByEmailIgnoreCase(String email);
}
