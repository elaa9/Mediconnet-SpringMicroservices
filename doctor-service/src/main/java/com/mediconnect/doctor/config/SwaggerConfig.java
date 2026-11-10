package com.mediconnect.doctor.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI doctorServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediConnect - Doctor Service API")
                        .description("REST API for doctor management. Manages doctor profiles, " +
                                "specializations, and availability.")
                        .version("1.0.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Direct access"),
                        new Server().url("http://localhost:8080").description("Via API Gateway")
                ));
    }
}
