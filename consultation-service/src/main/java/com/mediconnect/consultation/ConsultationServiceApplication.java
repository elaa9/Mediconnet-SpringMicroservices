package com.mediconnect.consultation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediConnect Consultation Service
 *
 * Manages medical consultation records independently.
 * Uses IDs to reference patients, doctors, and appointments from other services.
 *
 * Port: 8084
 * Database: mediconnect_consultations_db
 * Swagger: http://localhost:8084/swagger-ui.html
 */
@SpringBootApplication
public class ConsultationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsultationServiceApplication.class, args);
    }
}
