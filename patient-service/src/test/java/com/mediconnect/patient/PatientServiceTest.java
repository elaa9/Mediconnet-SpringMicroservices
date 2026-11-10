package com.mediconnect.patient;

import com.mediconnect.patient.entity.Patient;
import com.mediconnect.patient.exception.DuplicateEmailException;
import com.mediconnect.patient.exception.PatientNotFoundException;
import com.mediconnect.patient.repository.PatientRepository;
import com.mediconnect.patient.service.PatientServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PatientServiceImpl.
 * Uses Mockito to mock the repository layer.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Patient Service Unit Tests")
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientServiceImpl patientService;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        samplePatient = Patient.builder()
                .id(1L)
                .firstName("Alice")
                .lastName("Martin")
                .email("alice@example.com")
                .phone("+212600111001")
                .dateOfBirth(LocalDate.of(1985, 3, 15))
                .gender("Female")
                .build();
    }

    // ---- Test 1: Create a valid patient ----
    @Test
    @DisplayName("Should create a valid patient successfully")
    void shouldCreatePatient_WhenEmailIsUnique() {
        when(patientRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(samplePatient);

        Patient result = patientService.createPatient(samplePatient);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("Alice");
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
        verify(patientRepository, times(1)).save(samplePatient);
    }

    // ---- Test 2: Reject duplicate email ----
    @Test
    @DisplayName("Should throw DuplicateEmailException when email already exists")
    void shouldThrowException_WhenEmailAlreadyExists() {
        when(patientRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> patientService.createPatient(samplePatient))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("alice@example.com");

        verify(patientRepository, never()).save(any());
    }

    // ---- Test 3: Get all patients ----
    @Test
    @DisplayName("Should return all patients")
    void shouldReturnAllPatients() {
        Patient p2 = Patient.builder().id(2L).firstName("Bob").email("bob@example.com").build();
        when(patientRepository.findAll()).thenReturn(Arrays.asList(samplePatient, p2));

        List<Patient> patients = patientService.getAllPatients();

        assertThat(patients).hasSize(2);
        assertThat(patients.get(0).getFirstName()).isEqualTo("Alice");
    }

    // ---- Test 4: Get patient by ID — found ----
    @Test
    @DisplayName("Should return patient when ID exists")
    void shouldReturnPatient_WhenIdExists() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        Patient result = patientService.getPatientById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getLastName()).isEqualTo("Martin");
    }

    // ---- Test 5: Get patient by ID — not found ----
    @Test
    @DisplayName("Should throw PatientNotFoundException when ID does not exist")
    void shouldThrowException_WhenPatientIdNotFound() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientService.getPatientById(99L))
                .isInstanceOf(PatientNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ---- Test 6: Delete patient ----
    @Test
    @DisplayName("Should delete patient when ID exists")
    void shouldDeletePatient_WhenIdExists() {
        when(patientRepository.existsById(1L)).thenReturn(true);
        doNothing().when(patientRepository).deleteById(1L);

        assertThatCode(() -> patientService.deletePatient(1L)).doesNotThrowAnyException();
        verify(patientRepository, times(1)).deleteById(1L);
    }

    // ---- Test 7: Delete patient — not found ----
    @Test
    @DisplayName("Should throw PatientNotFoundException when deleting nonexistent patient")
    void shouldThrowException_WhenDeletingNonexistentPatient() {
        when(patientRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> patientService.deletePatient(99L))
                .isInstanceOf(PatientNotFoundException.class);

        verify(patientRepository, never()).deleteById(any());
    }
}
