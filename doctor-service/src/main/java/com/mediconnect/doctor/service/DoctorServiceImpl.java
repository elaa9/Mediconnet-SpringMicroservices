package com.mediconnect.doctor.service;

import com.mediconnect.doctor.auth.InvalidCredentialsException;
import com.mediconnect.doctor.auth.InvalidPasswordException;
import com.mediconnect.doctor.auth.LoginResponse;
import com.mediconnect.doctor.entity.Doctor;
import com.mediconnect.doctor.exception.DoctorNotFoundException;
import com.mediconnect.doctor.exception.DuplicateEmailException;
import com.mediconnect.doctor.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getAllDoctors() {
        log.info("Fetching all doctors");
        return doctorRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Doctor getDoctorById(Long id) {
        log.info("Fetching doctor with id: {}", id);
        return doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with id: " + id));
    }

    @Override
    public Doctor createDoctor(Doctor doctor) {
        log.info("Creating new doctor: {}", doctor.getEmail());
        if (doctorRepository.existsByEmailIgnoreCase(doctor.getEmail())) {
            throw new DuplicateEmailException("A doctor with email " + doctor.getEmail() + " already exists");
        }
        doctor.setPasswordHash(encodePassword(doctor.getPasswordHash()));
        Doctor saved = doctorRepository.save(doctor);
        log.info("Doctor created with id: {}", saved.getId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse authenticate(String email, String password) {
        Doctor doctor = doctorRepository.findByEmailIgnoreCase(email.trim())
                .filter(d -> d.getPasswordHash() != null
                        && passwordEncoder.matches(password, d.getPasswordHash()))
                .orElseThrow(InvalidCredentialsException::new);

        return new LoginResponse(doctor.getId(), "DOCTOR",
                doctor.getFirstName() + " " + doctor.getLastName(), doctor.getEmail());
    }

    @Override
    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        log.info("Updating doctor with id: {}", id);
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new DoctorNotFoundException("Doctor not found with id: " + id));

        if (!existing.getEmail().equalsIgnoreCase(updatedDoctor.getEmail())
                && doctorRepository.existsByEmailIgnoreCase(updatedDoctor.getEmail())) {
            throw new DuplicateEmailException("A doctor with email " + updatedDoctor.getEmail() + " already exists");
        }

        existing.setFirstName(updatedDoctor.getFirstName());
        existing.setLastName(updatedDoctor.getLastName());
        existing.setEmail(updatedDoctor.getEmail());
        existing.setPhone(updatedDoctor.getPhone());
        existing.setSpecialization(updatedDoctor.getSpecialization());
        existing.setExperienceYears(updatedDoctor.getExperienceYears());
        existing.setDescription(updatedDoctor.getDescription());
        existing.setConsultationPrice(updatedDoctor.getConsultationPrice());
        existing.setAvailable(updatedDoctor.getAvailable());
        if (updatedDoctor.getPasswordHash() != null && !updatedDoctor.getPasswordHash().isBlank()) {
            existing.setPasswordHash(encodePassword(updatedDoctor.getPasswordHash()));
        }

        return doctorRepository.save(existing);
    }

    @Override
    public void deleteDoctor(Long id) {
        log.info("Deleting doctor with id: {}", id);
        if (!doctorRepository.existsById(id)) {
            throw new DoctorNotFoundException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        log.info("Fetching doctors with specialization: {}", specialization);
        return doctorRepository.findBySpecializationIgnoreCase(specialization);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> getAvailableDoctors() {
        log.info("Fetching available doctors");
        return doctorRepository.findByAvailableTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> searchDoctors(String keyword) {
        log.info("Searching doctors with keyword: {}", keyword);
        return doctorRepository
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
