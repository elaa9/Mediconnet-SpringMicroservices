package com.mediconnect.patient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediConnect Patient Service
 *
 * Manages patient information independently with its own MySQL database.
 * Registers with Eureka for service discovery.
 *
 * Port: 8081
 * Database: mediconnect_patients_db
 * Swagger: http://localhost:8081/swagger-ui.html
 */
@SpringBootApplication
public class PatientServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PatientServiceApplication.class, args);
    }
}
