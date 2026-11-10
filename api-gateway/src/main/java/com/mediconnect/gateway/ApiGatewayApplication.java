package com.mediconnect.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediConnect API Gateway
 *
 * Single entry point routing all frontend requests to the appropriate
 * microservices via Eureka service discovery.
 *
 * Routes:
 *   /api/patients/**        -> PATIENT-SERVICE
 *   /api/doctors/**         -> DOCTOR-SERVICE
 *   /api/appointments/**    -> APPOINTMENT-SERVICE
 *   /api/consultations/**   -> CONSULTATION-SERVICE
 *
 * Access: http://localhost:8080
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
