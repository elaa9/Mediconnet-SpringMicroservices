package com.mediconnect.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * MediConnect Discovery Server
 *
 * Acts as the Eureka service registry. All microservices register here,
 * enabling service discovery and dynamic routing.
 *
 * Dashboard: http://localhost:8761
 */
@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
