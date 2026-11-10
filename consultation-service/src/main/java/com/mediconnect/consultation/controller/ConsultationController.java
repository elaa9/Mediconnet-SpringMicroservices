package com.mediconnect.consultation.controller;

import com.mediconnect.consultation.entity.Consultation;
import com.mediconnect.consultation.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultation API", description = "Medical consultation record management")
public class ConsultationController {

    private final ConsultationService consultationService;

    @GetMapping
    @Operation(summary = "Get all consultations")
    public ResponseEntity<List<Consultation>> getAllConsultations() {
        return ResponseEntity.ok(consultationService.getAllConsultations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get consultation by ID")
    public ResponseEntity<Consultation> getConsultationById(@PathVariable Long id) {
        return ResponseEntity.ok(consultationService.getConsultationById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new consultation record")
    public ResponseEntity<Consultation> createConsultation(@Valid @RequestBody Consultation consultation) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationService.createConsultation(consultation));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a consultation record")
    public ResponseEntity<Consultation> updateConsultation(
            @PathVariable Long id,
            @Valid @RequestBody Consultation consultation) {
        return ResponseEntity.ok(consultationService.updateConsultation(id, consultation));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a consultation record")
    public ResponseEntity<Void> deleteConsultation(@PathVariable Long id) {
        consultationService.deleteConsultation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get consultations by patient ID")
    public ResponseEntity<List<Consultation>> getConsultationsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(consultationService.getConsultationsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get consultations by doctor ID")
    public ResponseEntity<List<Consultation>> getConsultationsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(consultationService.getConsultationsByDoctor(doctorId));
    }

    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Get consultation by appointment ID")
    public ResponseEntity<Consultation> getConsultationByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(consultationService.getConsultationByAppointment(appointmentId));
    }
}
