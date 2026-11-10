package com.mediconnect.doctor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediConnect Doctor Service
 *
 * Manages doctor profiles, specializations, and availability.
 * Registers with Eureka for service discovery.
 *
 * Port: 8082
 * Database: mediconnect_doctors_db
 * Swagger: http://localhost:8082/swagger-ui.html
 */
@SpringBootApplication
public class DoctorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorServiceApplication.class, args);
    }
}
