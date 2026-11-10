package com.mediconnect.appointment.feign;

import com.mediconnect.appointment.exception.ServiceUnavailableException;
import com.mediconnect.appointment.model.DoctorModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

/**
 * Fallback factory for DoctorClient.
 *
 * Activated when DOCTOR-SERVICE is unavailable.
 * Returns a controlled ServiceUnavailableException instead of crashing.
 */
@Component
@Slf4j
public class DoctorClientFallbackFactory implements FallbackFactory<DoctorClient> {

    @Override
    public DoctorClient create(Throwable cause) {
        log.warn("DoctorClient fallback activated. Cause: {}", cause.getMessage());

        return new DoctorClient() {
            @Override
            public DoctorModel getDoctorById(Long id) {
                log.error("DOCTOR-SERVICE unavailable. Cannot retrieve doctor with id: {}", id);
                throw new ServiceUnavailableException(
                        "DOCTOR_SERVICE_UNAVAILABLE",
                        "Doctor information is temporarily unavailable. Please try again later.",
                        cause
                );
            }
        };
    }
}
