package com.mediconnect.appointment.feign;

import com.mediconnect.appointment.model.PatientModel;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * OpenFeign client for PATIENT-SERVICE.
 *
 * Uses Eureka service discovery — the name "PATIENT-SERVICE" is resolved
 * dynamically via Eureka instead of a hardcoded URL.
 *
 * This demonstrates:
 * - Service-to-service communication without hardcoded hostnames
 * - Load balancing across multiple instances of PATIENT-SERVICE
 */
@FeignClient(
        name = "PATIENT-SERVICE",
        fallbackFactory = PatientClientFallbackFactory.class
)
public interface PatientClient {

    @GetMapping("/api/patients/{id}")
    PatientModel getPatientById(@PathVariable("id") Long id);

    @GetMapping("/api/patients/email/{email}")
    PatientModel getPatientByEmail(@PathVariable("email") String email);
}
