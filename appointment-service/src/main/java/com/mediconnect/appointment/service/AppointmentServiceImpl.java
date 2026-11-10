package com.mediconnect.appointment.service;

import com.mediconnect.appointment.entity.Appointment;
import com.mediconnect.appointment.exception.AppointmentNotFoundException;
import com.mediconnect.appointment.exception.DoctorNotAvailableException;
import com.mediconnect.appointment.feign.DoctorClient;
import com.mediconnect.appointment.feign.PatientClient;
import com.mediconnect.appointment.model.DoctorModel;
import com.mediconnect.appointment.model.PatientModel;
import com.mediconnect.appointment.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Appointment service — the core orchestration layer.
 *
 * ACADEMIC CONCEPT — Inter-service Communication:
 *
 * When creating or retrieving appointments, this service calls:
 * 1. PatientClient (Feign) → PATIENT-SERVICE → GET /api/patients/{id}
 * 2. DoctorClient (Feign) → DOCTOR-SERVICE → GET /api/doctors/{id}
 *
 * The @Transient fields on Appointment (patientName, doctorName, etc.) are
 * populated here using the data returned by those Feign calls.
 * These fields are NEVER stored in the appointments database.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAllAppointments() {
        log.info("Fetching all appointments with enrichment");
        List<Appointment> appointments = appointmentRepository.findAll();
        appointments.forEach(this::enrichAppointment);
        return appointments;
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment getAppointmentById(Long id) {
        log.info("Fetching appointment with id: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with id: " + id));
        enrichAppointment(appointment);
        return appointment;
    }

    /**
     * Create appointment with full validation workflow:
     *
     * Step 1: Call PATIENT-SERVICE to verify patient exists
     * Step 2: Call DOCTOR-SERVICE to verify doctor exists and is available
     * Step 3: Save appointment (only own data — no patient/doctor names)
     * Step 4: Enrich response with patient and doctor names (@Transient fields)
     * Step 5: Return enriched appointment
     *
     * If either service is down, the fallback throws ServiceUnavailableException,
     * which is handled by GlobalExceptionHandler → HTTP 503.
     */
    @Override
    public Appointment createAppointment(Appointment appointment) {
        log.info("Creating appointment for patient {} with doctor {}",
                appointment.getPatientId(), appointment.getDoctorId());

        // Step 1: Validate patient exists (Feign call to PATIENT-SERVICE)
        log.info("Calling PATIENT-SERVICE to validate patient id: {}", appointment.getPatientId());
        PatientModel patient = patientClient.getPatientById(appointment.getPatientId());
        log.info("Patient validated: {}", patient.getFullName());

        // Step 2: Validate doctor exists and is available (Feign call to DOCTOR-SERVICE)
        log.info("Calling DOCTOR-SERVICE to validate doctor id: {}", appointment.getDoctorId());
        DoctorModel doctor = doctorClient.getDoctorById(appointment.getDoctorId());
        log.info("Doctor validated: {}", doctor.getFullName());

        // Step 3: Check doctor availability
        if (doctor.getAvailable() == null || !doctor.getAvailable()) {
            throw new DoctorNotAvailableException(
                    "Doctor " + doctor.getFullName() + " is not currently available for appointments.");
        }

        // Step 4: Set default status and save
        if (appointment.getStatus() == null || appointment.getStatus().isBlank()) {
            appointment.setStatus("CONFIRMED");
        }

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Appointment created with id: {}", saved.getId());

        // Step 5: Populate @Transient fields — these are NOT stored in the database
        saved.setPatientName(patient.getFullName());
        saved.setPatientEmail(patient.getEmail());
        saved.setDoctorName(doctor.getFullName());
        saved.setDoctorSpecialization(doctor.getSpecialization());

        return saved;
    }

    @Override
    public Appointment updateAppointment(Long id, Appointment updatedAppointment) {
        log.info("Updating appointment with id: {}", id);
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with id: " + id));

        existing.setPatientId(updatedAppointment.getPatientId());
        existing.setDoctorId(updatedAppointment.getDoctorId());
        existing.setAppointmentDate(updatedAppointment.getAppointmentDate());
        existing.setAppointmentTime(updatedAppointment.getAppointmentTime());
        existing.setReason(updatedAppointment.getReason());

        Appointment updated = appointmentRepository.save(existing);
        enrichAppointment(updated);
        return updated;
    }

    @Override
    public void deleteAppointment(Long id) {
        log.info("Deleting appointment with id: {}", id);
        if (!appointmentRepository.existsById(id)) {
            throw new AppointmentNotFoundException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        log.info("Fetching appointments for patient id: {}", patientId);
        List<Appointment> appointments =
                appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
        appointments.forEach(this::enrichAppointment);
        return appointments;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        log.info("Fetching appointments for doctor id: {}", doctorId);
        List<Appointment> appointments =
                appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId);
        appointments.forEach(this::enrichAppointment);
        return appointments;
    }

    @Override
    public Appointment updateAppointmentStatus(Long id, String status) {
        log.info("Updating status of appointment {} to {}", id, status);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found with id: " + id));
        appointment.setStatus(status.toUpperCase());
        Appointment updated = appointmentRepository.save(appointment);
        enrichAppointment(updated);
        return updated;
    }

    /**
     * Populates the @Transient fields of an appointment by calling remote services.
     *
     * If enrichment fails (service unavailable), gracefully sets fallback values
     * rather than failing the entire request. This allows reading existing appointments
     * even when partner services are temporarily down.
     */
    private void enrichAppointment(Appointment appointment) {
        // Enrich patient data
        try {
            PatientModel patient = patientClient.getPatientById(appointment.getPatientId());
            appointment.setPatientName(patient.getFullName());
            appointment.setPatientEmail(patient.getEmail());
        } catch (Exception e) {
            log.warn("Could not enrich patient data for appointment {}: {}", appointment.getId(), e.getMessage());
            appointment.setPatientName("Patient #" + appointment.getPatientId() + " (unavailable)");
            appointment.setPatientEmail("N/A");
        }

        // Enrich doctor data
        try {
            DoctorModel doctor = doctorClient.getDoctorById(appointment.getDoctorId());
            appointment.setDoctorName(doctor.getFullName());
            appointment.setDoctorSpecialization(doctor.getSpecialization());
        } catch (Exception e) {
            log.warn("Could not enrich doctor data for appointment {}: {}", appointment.getId(), e.getMessage());
            appointment.setDoctorName("Doctor #" + appointment.getDoctorId() + " (unavailable)");
            appointment.setDoctorSpecialization("N/A");
        }
    }
}
