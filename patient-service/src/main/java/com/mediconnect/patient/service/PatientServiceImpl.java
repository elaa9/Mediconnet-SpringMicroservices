package com.mediconnect.patient.service;

import com.mediconnect.patient.auth.InvalidCredentialsException;
import com.mediconnect.patient.auth.InvalidPasswordException;
import com.mediconnect.patient.auth.LoginResponse;
import com.mediconnect.patient.entity.Patient;
import com.mediconnect.patient.exception.DuplicateEmailException;
import com.mediconnect.patient.exception.PatientNotFoundException;
import com.mediconnect.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.nio.charset.StandardCharsets;

/**
 * Patient service implementation.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<Patient> getAllPatients() {
        log.info("Fetching all patients");
        return patientRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientById(Long id) {
        log.info("Fetching patient with id: {}", id);
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + id));
    }

    @Override
    public Patient createPatient(Patient patient) {
        log.info("Creating new patient: {}", patient.getEmail());
        if (patientRepository.existsByEmailIgnoreCase(patient.getEmail())) {
            throw new DuplicateEmailException("A patient with email " + patient.getEmail() + " already exists");
        }
        patient.setPasswordHash(encodePassword(patient.getPasswordHash()));
        Patient saved = patientRepository.save(patient);
        log.info("Patient created with id: {}", saved.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse authenticate(String email, String password) {
        Patient patient = patientRepository.findByEmailIgnoreCase(email.trim())
                .filter(p -> p.getPasswordHash() != null
                        && passwordEncoder.matches(password, p.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        return new LoginResponse(patient.getId(), "PATIENT",
                patient.getFirstName() + " " + patient.getLastName(), patient.getEmail());
    }

    @Override
    public Patient updatePatient(Long id, Patient updatedPatient) {
        log.info("Updating patient with id: {}", id);
        Patient existing = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with id: " + id));

        // Check email uniqueness only if email changed
        if (!existing.getEmail().equalsIgnoreCase(updatedPatient.getEmail())
                && patientRepository.existsByEmailIgnoreCase(updatedPatient.getEmail())) {
            throw new DuplicateEmailException("A patient with email " + updatedPatient.getEmail() + " already exists");
        }

        existing.setFirstName(updatedPatient.getFirstName());
        existing.setLastName(updatedPatient.getLastName());
        existing.setEmail(updatedPatient.getEmail());
        existing.setPhone(updatedPatient.getPhone());
        existing.setDateOfBirth(updatedPatient.getDateOfBirth());
        existing.setGender(updatedPatient.getGender());
        existing.setAddress(updatedPatient.getAddress());
        existing.setMedicalHistory(updatedPatient.getMedicalHistory());
        if (updatedPatient.getPasswordHash() != null && !updatedPatient.getPasswordHash().isBlank()) {
            existing.setPasswordHash(encodePassword(updatedPatient.getPasswordHash()));
        }

        return patientRepository.save(existing);
    }

    @Override
    public void deletePatient(Long id) {
        log.info("Deleting patient with id: {}", id);
        if (!patientRepository.existsById(id)) {
            throw new PatientNotFoundException("Patient not found with id: " + id);
        }
        patientRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Patient getPatientByEmail(String email) {
        log.info("Fetching patient with email: {}", email);
        return patientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new PatientNotFoundException("Patient not found with email: " + email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> searchPatients(String keyword) {
        log.info("Searching patients with keyword: {}", keyword);
        return patientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword);
    }

    private String encodePassword(String password) {
        if (password == null) {
            throw new InvalidPasswordException();
        }
        int passwordBytes = password.getBytes(StandardCharsets.UTF_8).length;
        if (passwordBytes < 8 || passwordBytes > 72) {
            throw new InvalidPasswordException();
        }
        return passwordEncoder.encode(password);
    }
}
