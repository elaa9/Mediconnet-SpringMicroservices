package com.mediconnect.consultation;

import com.mediconnect.consultation.entity.Consultation;
import com.mediconnect.consultation.exception.ConsultationNotFoundException;
import com.mediconnect.consultation.repository.ConsultationRepository;
import com.mediconnect.consultation.service.ConsultationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Consultation Service Unit Tests")
class ConsultationServiceTest {

    @Mock
    private ConsultationRepository consultationRepository;

    @InjectMocks
    private ConsultationServiceImpl consultationService;

    private Consultation sample;

    @BeforeEach
    void setUp() {
        sample = Consultation.builder()
                .id(1L)
                .appointmentId(8L)
                .patientId(1L)
                .doctorId(6L)
                .diagnosis("Hypertension stage 1")
                .prescription("Amlodipine 5mg")
                .consultationDate(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create consultation")
    void shouldCreateConsultation() {
        when(consultationRepository.save(any())).thenReturn(sample);
        Consultation result = consultationService.createConsultation(sample);
        assertThat(result.getDiagnosis()).isEqualTo("Hypertension stage 1");
    }

    @Test
    @DisplayName("Should return all consultations")
    void shouldReturnAll() {
        when(consultationRepository.findAll()).thenReturn(List.of(sample));
        assertThat(consultationService.getAllConsultations()).hasSize(1);
    }

    @Test
    @DisplayName("Should throw when consultation not found")
    void shouldThrowWhenNotFound() {
        when(consultationRepository.findById(anyLong())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> consultationService.getConsultationById(99L))
                .isInstanceOf(ConsultationNotFoundException.class);
    }

    @Test
    @DisplayName("Should return consultations by patient")
    void shouldReturnByPatient() {
        when(consultationRepository.findByPatientIdOrderByConsultationDateDesc(1L)).thenReturn(List.of(sample));
        assertThat(consultationService.getConsultationsByPatient(1L)).hasSize(1);
    }
}
