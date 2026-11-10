package com.mediconnect.appointment.feign;

import com.mediconnect.appointment.model.DoctorModel;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * OpenFeign client for DOCTOR-SERVICE.
 *
 * Communicates with the doctor-service via Eureka service discovery.
 * No hardcoded URLs — the service name "DOCTOR-SERVICE" is resolved dynamically.
 */
@FeignClient(
        name = "DOCTOR-SERVICE",
        fallbackFactory = DoctorClientFallbackFactory.class
)
public interface DoctorClient {

    @GetMapping("/api/doctors/{id}")
    DoctorModel getDoctorById(@PathVariable("id") Long id);
}
