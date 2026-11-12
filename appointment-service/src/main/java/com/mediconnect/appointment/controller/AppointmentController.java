package com.mediconnect.appointment.controller;

import com.mediconnect.appointment.entity.Appointment;
import com.mediconnect.appointment.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Appointment management.
 *
 * Key academic demonstration:
 * - POST /api/appointments triggers Feign calls to PATIENT-SERVICE and DOCTOR-SERVICE
 * - Responses include enriched @Transient fields (patientName, doctorName)
 * - If a dependent service is down, the endpoint returns HTTP 503 with a clear message
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointment API", description = "Appointment management with OpenFeign inter-service communication")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @Operation(summary = "Get all appointments",
            description = "Returns all appointments enriched with patient and doctor names from remote services")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID with enriched patient/doctor data")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Appointment found with enriched data"),
            @ApiResponse(responseCode = "404", description = "Appointment not found"),
            @ApiResponse(responseCode = "503", description = "Patient or Doctor service unavailable")
    })
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new appointment",
            description = "Validates patient and doctor via Feign, checks doctor availability, " +
                    "then creates the appointment. The response includes @Transient fields " +
                    "patientName, patientEmail, doctorName, doctorSpecialization.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Appointment created with enriched response"),
            @ApiResponse(responseCode = "400", description = "Validation error"),
            @ApiResponse(responseCode = "409", description = "Doctor not available"),
            @ApiResponse(responseCode = "503", description = "Patient or Doctor service unavailable")
    })
    public ResponseEntity<Appointment> createAppointment(@Valid @RequestBody Appointment appointment) {
        Appointment created = appointmentService.createAppointment(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an appointment")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable("id") Long id,
            @Valid @RequestBody Appointment appointment) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, appointment));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an appointment")
    public ResponseEntity<Void> deleteAppointment(@PathVariable("id") Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get appointments by patient ID")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatient(
            @PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get appointments by doctor ID")
    public ResponseEntity<List<Appointment>> getAppointmentsByDoctor(
            @PathVariable("doctorId") Long doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctorId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status",
            description = "Valid statuses: PENDING, CONFIRMED, CANCELLED, COMPLETED")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated"),
            @ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, status));
    }
}
