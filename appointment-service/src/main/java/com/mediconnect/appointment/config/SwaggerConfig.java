package com.mediconnect.appointment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI appointmentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediConnect - Appointment Service API")
                        .description("Orchestration microservice demonstrating OpenFeign inter-service " +
                                "communication and @Transient data enrichment. " +
                                "Communicates with PATIENT-SERVICE and DOCTOR-SERVICE via Eureka.")
                        .version("1.0.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8083").description("Direct access"),
                        new Server().url("http://localhost:8080").description("Via API Gateway")
                ));
    }
}
