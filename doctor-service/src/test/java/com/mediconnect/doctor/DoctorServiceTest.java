package com.mediconnect.doctor;

import com.mediconnect.doctor.entity.Doctor;
import com.mediconnect.doctor.auth.LoginResponse;
import com.mediconnect.doctor.exception.DoctorNotFoundException;
import com.mediconnect.doctor.exception.DuplicateEmailException;
import com.mediconnect.doctor.repository.DoctorRepository;
import com.mediconnect.doctor.service.DoctorServiceImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Doctor Service Unit Tests")
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DoctorServiceImpl doctorService;

    private Doctor sampleDoctor;

    @BeforeEach
    void setUp() {
        sampleDoctor = Doctor.builder()
                .id(1L)
                .firstName("Youssef")
                .lastName("El Idrissi")
                .email("youssef@mediconnect.com")
                .passwordHash("initial-password")
                .specialization("Cardiology")
                .experienceYears(15)
                .consultationPrice(new BigDecimal("350.00"))
                .available(true)
                .build();
    }

    @Test
    @DisplayName("Should create a valid doctor")
    void shouldCreateDoctor() {
        when(doctorRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode("initial-password")).thenReturn("encoded-password");
        when(doctorRepository.save(any())).thenReturn(sampleDoctor);

        Doctor result = doctorService.createDoctor(sampleDoctor);

        assertThat(result).isNotNull();
        assertThat(result.getSpecialization()).isEqualTo("Cardiology");
        assertThat(sampleDoctor.getPasswordHash()).isEqualTo("encoded-password");
    }

    @Test
    @DisplayName("Should authenticate a doctor using the stored password hash")
    void shouldAuthenticateDoctor() {
        sampleDoctor.setPasswordHash("encoded-password");
        when(doctorRepository.findByEmailIgnoreCase("youssef@mediconnect.com")).thenReturn(Optional.of(sampleDoctor));
        when(passwordEncoder.matches("initial-password", "encoded-password")).thenReturn(true);

        LoginResponse result = doctorService.authenticate("youssef@mediconnect.com", "initial-password");

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.role()).isEqualTo("DOCTOR");
        assertThat(result.email()).isEqualTo("youssef@mediconnect.com");
    }

    @Test
    @DisplayName("Should accept passwords in requests without serializing them in doctor responses")
    void shouldHideDoctorPasswordFromJson() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Doctor doctor = mapper.readValue("{\"password\":\"initial-password\"}", Doctor.class);

        assertThat(doctor.getPasswordHash()).isEqualTo("initial-password");
        assertThat(mapper.writeValueAsString(doctor)).doesNotContain("password");
    }

    @Test
    @DisplayName("Should reject doctor with duplicate email")
    void shouldRejectDuplicateEmail() {
        when(doctorRepository.existsByEmailIgnoreCase(anyString())).thenReturn(true);
        assertThatThrownBy(() -> doctorService.createDoctor(sampleDoctor))
                .isInstanceOf(DuplicateEmailException.class);
    }

    @Test
    @DisplayName("Should return available doctors")
    void shouldReturnAvailableDoctors() {
        when(doctorRepository.findByAvailableTrue()).thenReturn(List.of(sampleDoctor));
        List<Doctor> result = doctorService.getAvailableDoctors();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAvailable()).isTrue();
    }

    @Test
    @DisplayName("Should throw when doctor not found")
    void shouldThrowWhenDoctorNotFound() {
        when(doctorRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> doctorService.getDoctorById(99L))
                .isInstanceOf(DoctorNotFoundException.class);
    }
}
