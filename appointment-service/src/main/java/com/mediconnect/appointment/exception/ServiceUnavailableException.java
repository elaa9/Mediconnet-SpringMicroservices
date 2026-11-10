package com.mediconnect.appointment.exception;

import lombok.Getter;

/**
 * Thrown when a dependent microservice (Patient or Doctor) is unavailable.
 * Carries a machine-readable error code and a human-readable message.
 */
@Getter
public class ServiceUnavailableException extends RuntimeException {

    private final String errorCode;

    public ServiceUnavailableException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ServiceUnavailableException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
