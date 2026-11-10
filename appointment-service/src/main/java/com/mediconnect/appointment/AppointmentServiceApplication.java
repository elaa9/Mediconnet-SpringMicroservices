package com.mediconnect.appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * MediConnect Appointment Service
 *
 * The main orchestration microservice. Communicates with both Patient Service
 * and Doctor Service via OpenFeign to validate and enrich appointment data.
 *
 * Key academic concepts demonstrated:
 * - OpenFeign inter-service communication
 * - @Transient data enrichment (patient/doctor names not stored in DB)
 * - Resilience4j circuit breaker (fault tolerance when partner services fail)
 *
 * Port: 8083
 * Database: mediconnect_appointments_db
 * Swagger: http://localhost:8083/swagger-ui.html
 */
@SpringBootApplication
@EnableFeignClients
public class AppointmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentServiceApplication.class, args);
    }
}
