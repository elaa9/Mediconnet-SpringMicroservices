package com.mediconnect.doctor;

import com.mediconnect.doctor.entity.Doctor;
import com.mediconnect.doctor.exception.DoctorNotFoundException;
import com.mediconnect.doctor.exception.DuplicateEmailException;
import com.mediconnect.doctor.repository.DoctorRepository;
import com.mediconnect.doctor.service.DoctorServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
                .specialization("Cardiology")
                .experienceYears(15)
                .consultationPrice(new BigDecimal("350.00"))
                .available(true)
                .build();
    }

    @Test
    @DisplayName("Should create a valid doctor")
    void shouldCreateDoctor() {
        when(doctorRepository.existsByEmail(anyString())).thenReturn(false);
        when(doctorRepository.save(any())).thenReturn(sampleDoctor);

        Doctor result = doctorService.createDoctor(sampleDoctor);

        assertThat(result).isNotNull();
        assertThat(result.getSpecialization()).isEqualTo("Cardiology");
    }

    @Test
    @DisplayName("Should reject doctor with duplicate email")
    void shouldRejectDuplicateEmail() {
        when(doctorRepository.existsByEmail(anyString())).thenReturn(true);
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
