package com.mediconnect.appointment;

import com.mediconnect.appointment.entity.Appointment;
import com.mediconnect.appointment.exception.AppointmentNotFoundException;
import com.mediconnect.appointment.exception.DoctorNotAvailableException;
import com.mediconnect.appointment.exception.ServiceUnavailableException;
import com.mediconnect.appointment.feign.DoctorClient;
import com.mediconnect.appointment.feign.PatientClient;
import com.mediconnect.appointment.model.DoctorModel;
import com.mediconnect.appointment.model.PatientModel;
import com.mediconnect.appointment.repository.AppointmentRepository;
import com.mediconnect.appointment.service.AppointmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AppointmentServiceImpl.
 *
 * Tests the core academic requirements:
 * - Feign client calls to Patient and Doctor services
 * - @Transient enrichment of appointment responses
 * - Validation (patient exists, doctor exists, doctor available)
 * - Fault tolerance when services are unavailable
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Appointment Service Unit Tests")
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientClient patientClient;

    @Mock
    private DoctorClient doctorClient;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    private PatientModel samplePatient;
    private DoctorModel sampleDoctor;
    private Appointment sampleAppointment;

    @BeforeEach
    void setUp() {
        samplePatient = new PatientModel();
        samplePatient.setId(1L);
        samplePatient.setFirstName("Alice");
        samplePatient.setLastName("Martin");
        samplePatient.setEmail("alice@example.com");

        sampleDoctor = new DoctorModel();
        sampleDoctor.setId(1L);
        sampleDoctor.setFirstName("Youssef");
        sampleDoctor.setLastName("El Idrissi");
        sampleDoctor.setSpecialization("Cardiology");
        sampleDoctor.setAvailable(true);

        sampleAppointment = Appointment.builder()
                .id(1L)
                .patientId(1L)
                .doctorId(1L)
                .appointmentDate(LocalDate.of(2026, 11, 15))
                .appointmentTime(LocalTime.of(9, 0))
                .reason("General consultation")
                .status("PENDING")
                .build();
    }

    // ---- Test 1: Create appointment with valid patient and doctor ----
    @Test
    @DisplayName("Should create appointment when patient and doctor both exist and doctor is available")
    void shouldCreateAppointment_WhenPatientAndDoctorExistAndDoctorAvailable() {
        Appointment newAppointment = Appointment.builder()
                .patientId(1L)
                .doctorId(1L)
                .appointmentDate(LocalDate.of(2026, 11, 15))
                .appointmentTime(LocalTime.of(9, 0))
                .reason("Consultation")
                .build();

        when(patientClient.getPatientById(1L)).thenReturn(samplePatient);
        when(doctorClient.getDoctorById(1L)).thenReturn(sampleDoctor);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(sampleAppointment);

        Appointment result = appointmentService.createAppointment(newAppointment);

        assertThat(result).isNotNull();
        // Verify Feign clients were called
        verify(patientClient, times(1)).getPatientById(1L);
        verify(doctorClient, times(1)).getDoctorById(1L);
        // Verify appointment was persisted
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        // Verify @Transient fields are populated (data enrichment)
        assertThat(result.getPatientName()).isEqualTo("Alice Martin");
        assertThat(result.getPatientEmail()).isEqualTo("alice@example.com");
        assertThat(result.getDoctorName()).isEqualTo("Dr. Youssef El Idrissi");
        assertThat(result.getDoctorSpecialization()).isEqualTo("Cardiology");
    }

    // ---- Test 2: Reject appointment when doctor is not available ----
    @Test
    @DisplayName("Should throw DoctorNotAvailableException when doctor is not available")
    void shouldRejectAppointment_WhenDoctorNotAvailable() {
        sampleDoctor.setAvailable(false);

        when(patientClient.getPatientById(1L)).thenReturn(samplePatient);
        when(doctorClient.getDoctorById(1L)).thenReturn(sampleDoctor);

        assertThatThrownBy(() -> appointmentService.createAppointment(sampleAppointment))
                .isInstanceOf(DoctorNotAvailableException.class)
                .hasMessageContaining("not currently available");

        verify(appointmentRepository, never()).save(any());
    }

    // ---- Test 3: Handle Patient Service unavailability ----
    @Test
    @DisplayName("Should throw ServiceUnavailableException when PATIENT-SERVICE is down")
    void shouldThrowServiceUnavailable_WhenPatientServiceDown() {
        when(patientClient.getPatientById(1L)).thenThrow(
                new ServiceUnavailableException("PATIENT_SERVICE_UNAVAILABLE",
                        "Patient information is temporarily unavailable. Please try again later."));

        assertThatThrownBy(() -> appointmentService.createAppointment(sampleAppointment))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("Patient information is temporarily unavailable");

        // Appointment should NOT be saved when patient validation fails
        verify(appointmentRepository, never()).save(any());
    }

    // ---- Test 4: Handle Doctor Service unavailability ----
    @Test
    @DisplayName("Should throw ServiceUnavailableException when DOCTOR-SERVICE is down")
    void shouldThrowServiceUnavailable_WhenDoctorServiceDown() {
        when(patientClient.getPatientById(1L)).thenReturn(samplePatient);
        when(doctorClient.getDoctorById(1L)).thenThrow(
                new ServiceUnavailableException("DOCTOR_SERVICE_UNAVAILABLE",
                        "Doctor information is temporarily unavailable. Please try again later."));

        assertThatThrownBy(() -> appointmentService.createAppointment(sampleAppointment))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("Doctor information is temporarily unavailable");

        verify(appointmentRepository, never()).save(any());
    }

    // ---- Test 5: Get appointment by ID — enriched response ----
    @Test
    @DisplayName("Should return enriched appointment with @Transient fields populated")
    void shouldReturnEnrichedAppointment_WhenIdExists() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(sampleAppointment));
        when(patientClient.getPatientById(1L)).thenReturn(samplePatient);
        when(doctorClient.getDoctorById(1L)).thenReturn(sampleDoctor);

        Appointment result = appointmentService.getAppointmentById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        // These @Transient fields should be populated from Feign calls
        assertThat(result.getPatientName()).isEqualTo("Alice Martin");
        assertThat(result.getDoctorName()).isEqualTo("Dr. Youssef El Idrissi");
        assertThat(result.getDoctorSpecialization()).isEqualTo("Cardiology");
    }

    // ---- Test 6: Get appointment — not found ----
    @Test
    @DisplayName("Should throw AppointmentNotFoundException when ID does not exist")
    void shouldThrowException_WhenAppointmentIdNotFound() {
        when(appointmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.getAppointmentById(99L))
                .isInstanceOf(AppointmentNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ---- Test 7: Get all appointments ----
    @Test
    @DisplayName("Should return all appointments with enrichment")
    void shouldReturnAllAppointments() {
        when(appointmentRepository.findAll()).thenReturn(List.of(sampleAppointment));
        when(patientClient.getPatientById(1L)).thenReturn(samplePatient);
        when(doctorClient.getDoctorById(1L)).thenReturn(sampleDoctor);

        List<Appointment> results = appointmentService.getAllAppointments();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getPatientName()).isEqualTo("Alice Martin");
    }

    // ---- Test 8: Update appointment status ----
    @Test
    @DisplayName("Should update appointment status correctly")
    void shouldUpdateAppointmentStatus() {
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(sampleAppointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(sampleAppointment);
        when(patientClient.getPatientById(1L)).thenReturn(samplePatient);
        when(doctorClient.getDoctorById(1L)).thenReturn(sampleDoctor);

        Appointment result = appointmentService.updateAppointmentStatus(1L, "COMPLETED");

        verify(appointmentRepository, times(1)).save(argThat(a -> "COMPLETED".equals(a.getStatus())));
    }
}
