package com.mediconnect.appointment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Appointment JPA Entity
 *
 * IMPORTANT ACADEMIC CONCEPT — @Transient enrichment:
 *
 * This entity stores only patientId and doctorId as foreign keys (plain Long values).
 * The actual patient and doctor names are NOT stored in this table.
 * They are fetched at runtime via OpenFeign calls to PATIENT-SERVICE and DOCTOR-SERVICE,
 * and stored in @Transient fields (marked with @Transient so JPA ignores them).
 *
 * This demonstrates:
 * 1. Distributed data ownership — each service owns its own data
 * 2. No cross-service database joins
 * 3. Data enrichment via REST communication
 */
@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- PERSISTED DATA (owned by appointment-service) ----

    @NotNull(message = "Patient ID is required")
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @NotNull(message = "Appointment date is required")
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Builder.Default
    @Column(name = "status", nullable = false)
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ---- @Transient FIELDS: populated by OpenFeign, NOT stored in database ----

    /**
     * Patient full name — fetched from PATIENT-SERVICE via OpenFeign.
     * @Transient means JPA will NOT persist this field.
     * It is populated at runtime in the service layer.
     */
    @Transient
    private String patientName;

    /**
     * Patient email — fetched from PATIENT-SERVICE via OpenFeign.
     * Not persisted in this service's database.
     */
    @Transient
    private String patientEmail;

    /**
     * Doctor full name — fetched from DOCTOR-SERVICE via OpenFeign.
     * Not persisted in this service's database.
     */
    @Transient
    private String doctorName;

    /**
     * Doctor specialization — fetched from DOCTOR-SERVICE via OpenFeign.
     * Not persisted in this service's database.
     */
    @Transient
    private String doctorSpecialization;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}
