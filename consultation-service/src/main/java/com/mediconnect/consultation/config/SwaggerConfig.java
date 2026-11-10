package com.mediconnect.consultation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI consultationServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediConnect - Consultation Service API")
                        .description("REST API for medical consultation record management. " +
                                "Stores diagnosis, prescriptions, and medical notes.")
                        .version("1.0.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8084").description("Direct access"),
                        new Server().url("http://localhost:8080").description("Via API Gateway")
                ));
    }
}
