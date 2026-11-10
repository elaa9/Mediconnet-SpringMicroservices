package com.mediconnect.appointment.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Doctor DTO used by appointment-service to receive data from DOCTOR-SERVICE via OpenFeign.
 *
 * This is NOT a JPA entity. It maps the JSON response from the doctor-service REST API.
 */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorModel {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String specialization;
    private Integer experienceYears;
    private BigDecimal consultationPrice;
    private Boolean available;

    public String getFullName() {
        return "Dr. " + firstName + " " + lastName;
    }
}
