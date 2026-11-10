package com.mediconnect.appointment.feign;

import com.mediconnect.appointment.exception.ServiceUnavailableException;
import com.mediconnect.appointment.model.PatientModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

/**
 * Fallback factory for PatientClient.
 *
 * When PATIENT-SERVICE is unavailable (down, timeout, etc.),
 * Resilience4j activates this fallback instead of propagating the error.
 *
 * ACADEMIC DEMONSTRATION:
 * Stop the patient-service and try to create an appointment.
 * You will see this fallback being invoked, returning a controlled error
 * instead of an unhandled exception.
 */
@Component
@Slf4j
public class PatientClientFallbackFactory implements FallbackFactory<PatientClient> {

    @Override
    public PatientClient create(Throwable cause) {
        log.warn("PatientClient fallback activated. Cause: {}", cause.getMessage());

        return new PatientClient() {

            @Override
            public PatientModel getPatientById(Long id) {
                log.error("PATIENT-SERVICE unavailable. Cannot retrieve patient with id: {}", id);
                throw new ServiceUnavailableException(
                        "PATIENT_SERVICE_UNAVAILABLE",
                        "Patient information is temporarily unavailable. Please try again later.",
                        cause
                );
            }

            @Override
            public PatientModel getPatientByEmail(String email) {
                log.error("PATIENT-SERVICE unavailable. Cannot retrieve patient with email: {}", email);
                throw new ServiceUnavailableException(
                        "PATIENT_SERVICE_UNAVAILABLE",
                        "Patient information is temporarily unavailable. Please try again later.",
                        cause
                );
            }
        };
    }
}
