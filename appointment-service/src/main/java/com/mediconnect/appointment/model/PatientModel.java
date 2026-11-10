package com.mediconnect.appointment.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Patient DTO used by appointment-service to receive data from PATIENT-SERVICE via OpenFeign.
 *
 * This is NOT a JPA entity. It's a simple POJO that maps the JSON response
 * from the patient-service REST API.
 *
 * @JsonIgnoreProperties(ignoreUnknown = true) ensures that if patient-service
 * adds new fields later, this service won't break.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatientModel {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
