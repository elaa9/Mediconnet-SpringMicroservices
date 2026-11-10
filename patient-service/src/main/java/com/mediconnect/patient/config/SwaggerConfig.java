package com.mediconnect.patient.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI patientServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediConnect - Patient Service API")
                        .description("REST API for patient management. " +
                                "Manages patient registration, profiles, and medical history.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("MediConnect Team")
                                .email("mediconnect@example.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Direct access"),
                        new Server().url("http://localhost:8080").description("Via API Gateway")
                ));
    }
}
