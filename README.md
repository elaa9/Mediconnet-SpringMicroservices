# MediConnect — Healthcare Management Platform

> A complete microservices-based healthcare management system built for the JEE2 university course.
> Demonstrates service discovery, API gateway, OpenFeign inter-service communication, @Transient data enrichment, and Resilience4j fault tolerance.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Architecture](#5-database-architecture)
6. [Prerequisites](#6-prerequisites)
7. [MySQL & phpMyAdmin Setup](#7-mysql--phpmyadmin-setup)
8. [How to Run — Backend](#8-how-to-run--backend)
9. [How to Run — Frontend](#9-how-to-run--frontend)
10. [Service URLs](#10-service-urls)
11. [API Endpoints](#11-api-endpoints)
12. [OpenFeign Explanation](#12-openfeign-explanation)
13. [@Transient Enrichment Explanation](#13-transient-enrichment-explanation)
14. [Resilience4j Fault Tolerance](#14-resilience4j-fault-tolerance)
15. [How to Test Service Failure](#15-how-to-test-service-failure)
16. [Testing Instructions](#16-testing-instructions)
17. [Common Errors & Solutions](#17-common-errors--solutions)
18. [French University Presentation Script](#18-french-university-presentation-script)

---

## 1. Project Overview

MediConnect is a healthcare management platform demonstrating a production-like microservices architecture. It manages:

- **Patients** — registration, profiles, medical history
- **Doctors** — profiles, specializations, availability
- **Appointments** — booking with patient/doctor validation
- **Consultations** — medical notes, diagnoses, prescriptions

Each domain is an independent Spring Boot application with its own MySQL database, registered with Eureka, routed through a Spring Cloud Gateway, and communicating via OpenFeign REST clients.

---

## 2. Architecture

```
React Frontend (port 5173)
        |
        | HTTP requests (all via gateway)
        v
  API Gateway (port 8080)
        |
        | Load-balanced routing via lb://SERVICE-NAME
        |
        |-----> PATIENT-SERVICE  (port 8081)  [mediconnect_patients_db]
        |-----> DOCTOR-SERVICE   (port 8082)  [mediconnect_doctors_db]
        |-----> APPOINTMENT-SERVICE (port 8083) [mediconnect_appointments_db]
        |               |
        |               | OpenFeign calls
        |               |-----> PATIENT-SERVICE
        |               |-----> DOCTOR-SERVICE
        |-----> CONSULTATION-SERVICE (port 8084) [mediconnect_consultations_db]

  Eureka Server (port 8761) — Service Registry
  All services register with Eureka on startup.
```

---

## 3. Technology Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Language     | Java 17                                        |
| Framework    | Spring Boot 3.4.1                              |
| Cloud        | Spring Cloud 2024.0.0                          |
| Discovery    | Netflix Eureka                                 |
| Gateway      | Spring Cloud Gateway (WebFlux)                 |
| Feign        | Spring Cloud OpenFeign                         |
| Resilience   | Resilience4j Circuit Breaker                   |
| ORM          | Spring Data JPA / Hibernate                    |
| Database     | MySQL 8.x                                      |
| Docs         | Springdoc OpenAPI / Swagger UI 2.7.0           |
| Build        | Maven (multi-module)                           |
| Frontend     | React 18 + Vite + TypeScript + Tailwind CSS    |
| HTTP Client  | Axios                                          |
| Routing      | React Router v6                                |

---

## 4. Project Structure

```
mediconnect/
├── pom.xml                     ← Maven multi-module parent
├── discovery-server/           ← Eureka Server (port 8761)
├── api-gateway/                ← Spring Cloud Gateway (port 8080)
├── patient-service/            ← Patient CRUD (port 8081)
├── doctor-service/             ← Doctor CRUD (port 8082)
├── appointment-service/        ← Appointment orchestration (port 8083)
│   ├── feign/                  ← OpenFeign clients
│   └── model/                  ← Patient/Doctor DTOs
├── consultation-service/       ← Consultation records (port 8084)
├── frontend/                   ← React + Vite + TypeScript
│   ├── src/api/                ← Axios API clients
│   ├── src/pages/              ← UI pages
│   ├── src/components/         ← Reusable components
│   ├── src/contexts/           ← Auth context
│   └── src/types/              ← TypeScript interfaces
├── database/                   ← SQL initialization scripts
└── README.md
```

---

## 5. Database Architecture

| Service              | Database                      | Tables       |
|----------------------|-------------------------------|--------------|
| patient-service      | mediconnect_patients_db       | patients     |
| doctor-service       | mediconnect_doctors_db        | doctors      |
| appointment-service  | mediconnect_appointments_db   | appointments |
| consultation-service | mediconnect_consultations_db  | consultations|

**Key principle:** No cross-service database foreign keys exist. Services reference each other only by ID, and exchange data exclusively via REST APIs.

---

## 6. Prerequisites

Install the following before running the project:

| Tool           | Version    | Download                              |
|----------------|------------|---------------------------------------|
| Java JDK       | 17+        | https://adoptium.net                  |
| Maven          | 3.8+       | https://maven.apache.org/download.cgi |
| Node.js        | 18+        | https://nodejs.org                    |
| MySQL          | 8.x        | Via XAMPP or standalone install       |
| phpMyAdmin     | Any        | Included in XAMPP                     |

---

## 7. MySQL & phpMyAdmin Setup

### Option A — XAMPP (recommended)
1. Download and install [XAMPP](https://www.apachefriends.org).
2. Start Apache and MySQL from the XAMPP Control Panel.
3. Open phpMyAdmin at `http://localhost/phpmyadmin`.
4. Run `database/01_create_databases.sql` to create all four databases.

### Option B — Standalone MySQL
```bash
mysql -u root -p < database/01_create_databases.sql
```

### Demo data (optional — run AFTER starting the services once)
```bash
mysql -u root -p < database/02_patients_demo_data.sql
mysql -u root -p < database/03_doctors_demo_data.sql
mysql -u root -p < database/04_appointments_demo_data.sql
mysql -u root -p < database/05_consultations_demo_data.sql
```

### Credentials
By default, services use:
- Username: `root`
- Password: *(empty)*

If your MySQL root account has a password, update `spring.datasource.password` in each service's `application.properties`.

---

## 8. How to Run — Backend

**Important:** Start the services in this exact order. Eureka must be running before other services register.

### Step 1 — Start MySQL
Launch MySQL (XAMPP or standalone).

### Step 2 — Discovery Server (FIRST)
```bash
cd discovery-server
mvn spring-boot:run
# Wait until: Started DiscoveryServerApplication on port 8761
```

Verify: `http://localhost:8761`

### Step 3 — Patient Service
```bash
cd patient-service
mvn spring-boot:run
```

### Step 4 — Doctor Service
```bash
cd doctor-service
mvn spring-boot:run
```

### Step 5 — Consultation Service
```bash
cd consultation-service
mvn spring-boot:run
```

### Step 6 — Appointment Service (AFTER patient + doctor are registered)
```bash
cd appointment-service
mvn spring-boot:run
```

### Step 7 — API Gateway (LAST)
```bash
cd api-gateway
mvn spring-boot:run
```

### Build all from root (requires all modules to compile)
```bash
cd mediconnect
mvn clean install -DskipTests
```

### IntelliJ IDEA
Open `mediconnect/pom.xml` as a Maven project. All six modules will be imported automatically. Use the Spring Boot run configurations for each service.

---

## 9. How to Run — Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`.

**Environment variable** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080
```

All API calls go through the API Gateway (port 8080). Never call individual service ports directly.

### Patient and doctor sign-in
Use the **Admin** demo shortcut to create patient or doctor records. Set an initial password (at least 8 characters) in the form. Then sign out and choose the matching role on the login screen, using that record's email and password. Passwords are stored as BCrypt hashes; editing a record without entering a new password keeps its current password. For records that existed before this change, edit the record and set a password before trying to log in.

The admin shortcut is still a local academic-demo role. Patient and doctor login verifies credentials and opens the matching profile, but the backend CRUD APIs do not yet enforce authentication or record ownership. Do not expose this demo to the internet or use it for real medical data.

---

## 10. Service URLs

| Service              | URL                                        |
|----------------------|--------------------------------------------|
| Eureka Dashboard     | http://localhost:8761                      |
| API Gateway          | http://localhost:8080                      |
| Patient Service      | http://localhost:8081                      |
| Doctor Service       | http://localhost:8082                      |
| Appointment Service  | http://localhost:8083                      |
| Consultation Service | http://localhost:8084                      |
| Patient Swagger UI   | http://localhost:8081/swagger-ui.html      |
| Doctor Swagger UI    | http://localhost:8082/swagger-ui.html      |
| Appointment Swagger  | http://localhost:8083/swagger-ui.html      |
| Consultation Swagger | http://localhost:8084/swagger-ui.html      |
| phpMyAdmin           | http://localhost/phpmyadmin                |
| React Frontend       | http://localhost:5173                      |

---

## 11. API Endpoints

### Patient Service (via Gateway: http://localhost:8080)
```
GET    /api/patients              — List all patients
GET    /api/patients/{id}         — Get patient by ID
POST   /api/patients              — Create patient
POST   /api/patients/auth/login   — Patient email/password login
PUT    /api/patients/{id}         — Update patient
DELETE /api/patients/{id}         — Delete patient
GET    /api/patients/email/{email} — Find by email
GET    /api/patients/search?keyword=Alice — Search
```

### Doctor Service
```
GET    /api/doctors               — List all doctors
GET    /api/doctors/{id}          — Get doctor by ID
POST   /api/doctors               — Create doctor
POST   /api/doctors/auth/login    — Doctor email/password login
PUT    /api/doctors/{id}          — Update doctor
DELETE /api/doctors/{id}          — Delete doctor
GET    /api/doctors/available     — Available doctors
GET    /api/doctors/specialization/{spec} — Filter by specialization
```

### Appointment Service
```
GET    /api/appointments          — All appointments (enriched)
GET    /api/appointments/{id}     — Single appointment (enriched)
POST   /api/appointments          — Create appointment (validates patient + doctor)
PUT    /api/appointments/{id}     — Update appointment
DELETE /api/appointments/{id}     — Delete appointment
GET    /api/appointments/patient/{id} — By patient
GET    /api/appointments/doctor/{id}  — By doctor
PATCH  /api/appointments/{id}/status  — Update status
```

### Consultation Service
```
GET    /api/consultations               — All consultations
GET    /api/consultations/{id}          — By ID
POST   /api/consultations               — Create
PUT    /api/consultations/{id}          — Update
DELETE /api/consultations/{id}          — Delete
GET    /api/consultations/patient/{id}  — By patient
GET    /api/consultations/doctor/{id}   — By doctor
GET    /api/consultations/appointment/{id} — By appointment
```

---

## 12. OpenFeign Explanation

The **Appointment Service** must communicate with both Patient Service and Doctor Service to:
1. Verify the patient exists before creating an appointment
2. Verify the doctor exists and is available

This is done using **Spring Cloud OpenFeign** — a declarative HTTP client.

```java
@FeignClient(name = "PATIENT-SERVICE", fallbackFactory = PatientClientFallbackFactory.class)
public interface PatientClient {
    @GetMapping("/api/patients/{id}")
    PatientModel getPatientById(@PathVariable("id") Long id);
}
```

The `name = "PATIENT-SERVICE"` matches the `spring.application.name` registered in Eureka. No hardcoded URL is used — Eureka resolves the actual host and port dynamically.

**Without OpenFeign** you would need to hardcode: `http://localhost:8081/api/patients/1`
**With OpenFeign** you just call: `patientClient.getPatientById(1L)` — Eureka handles routing.

---

## 13. @Transient Enrichment Explanation

The `Appointment` entity stores only `patientId` and `doctorId` as plain `Long` fields. The patient and doctor names are **not stored** in the appointments database.

```java
@Column(name = "patient_id")
private Long patientId;         // ← stored in DB

@Transient                      // ← JPA IGNORES this field
private String patientName;     // ← populated at runtime via Feign
```

When you request an appointment, the service:
1. Loads the appointment from MySQL (gets `patientId = 1`, `doctorId = 2`)
2. Calls `PATIENT-SERVICE` via Feign → gets `{ firstName: "Alice", lastName: "Martin" }`
3. Sets `appointment.patientName = "Alice Martin"` (the `@Transient` field)
4. Returns the enriched JSON

The response includes:
```json
{
  "id": 1,
  "patientId": 1,
  "doctorId": 2,
  "patientName": "Alice Martin",    ← NOT stored in DB
  "doctorName": "Dr. Youssef El Idrissi",  ← NOT stored in DB
  "doctorSpecialization": "Cardiology"     ← NOT stored in DB
}
```

This demonstrates the microservices principle: each service owns its own data, and cross-service data is composed at runtime.

---

## 14. Resilience4j Fault Tolerance

The Appointment Service uses **Resilience4j Circuit Breaker** to handle failures in dependent services.

**What happens without it:** If Patient Service is down, any appointment request crashes with `Connection refused` — a 500 error with no explanation.

**What happens with it:** The fallback factory is invoked and returns HTTP 503 with:
```json
{
  "error": "PATIENT_SERVICE_UNAVAILABLE",
  "message": "Patient information is temporarily unavailable. Please try again later.",
  "hint": "Make sure all microservices are running and registered with Eureka."
}
```

Configuration (`appointment-service/application.properties`):
```properties
spring.cloud.openfeign.circuitbreaker.enabled=true
resilience4j.circuitbreaker.instances.PATIENT-SERVICE.failure-rate-threshold=50
resilience4j.circuitbreaker.instances.PATIENT-SERVICE.wait-duration-in-open-state=10s
```

---

## 15. How to Test Service Failure

**Demo scenario for university presentation:**

1. Start all services normally (they all register with Eureka).
2. Try creating an appointment — it should succeed.
3. **Stop the Patient Service** (Ctrl+C in its terminal).
4. Try creating an appointment again:
   ```bash
   POST http://localhost:8080/api/appointments
   { "patientId": 1, "doctorId": 1, "appointmentDate": "2026-12-01", "appointmentTime": "09:00:00" }
   ```
5. The response will be HTTP 503 — controlled, not a crash.
6. **Restart the Patient Service**.
7. Try again — the circuit breaker recovers automatically.

---

## 16. Testing Instructions

### Backend unit tests (each service)
```bash
cd patient-service
mvn test

cd appointment-service
mvn test
```

Tests cover:
- Creating valid patients/doctors/appointments
- Rejecting duplicate emails
- Rejecting appointments with unavailable doctors
- Verifying @Transient enrichment
- Fallback behavior when services are down

### Frontend
```bash
cd frontend
npm install
npm run build   # TypeScript compilation check
```

---

## 17. Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection refused` on port 3306 | MySQL not started | Start MySQL via XAMPP or service |
| `Access denied for user 'root'@'localhost'` | Wrong password | Set `DB_PASSWORD` env variable |
| Service not registered in Eureka | Service started before Eureka | Start discovery-server FIRST, then wait 30 seconds |
| `lb://PATIENT-SERVICE - Unable to find instance` | Patient service not running | Start patient-service, wait for Eureka registration |
| Frontend `Network Error` | Backend not running | Start all backend services |
| Frontend shows `CORS` error | Gateway CORS config | Gateway is configured to allow `localhost:5173` |
| Port already in use | Another process using same port | Change server.port or kill the process |
| `createDatabaseIfNotExist` fails | Insufficient MySQL permissions | Grant CREATE privileges: `GRANT ALL ON *.* TO 'root'@'localhost';` |

---

## 18. French University Presentation Script

### Résumé du projet (Français)

**MediConnect** est une plateforme de gestion médicale construite avec une **architecture microservices** basée sur Spring Boot et Spring Cloud.

### Architecture globale

Le système est composé de **6 microservices indépendants** :

1. **Eureka Server** — Registre de services. Chaque microservice s'y inscrit au démarrage et l'utilise pour trouver les autres services.
2. **API Gateway** — Point d'entrée unique. Le frontend envoie toutes ses requêtes à un seul port (8080), et la Gateway redirige vers le bon microservice en utilisant Eureka.
3. **Patient Service** (8081) — Gère les informations des patients dans sa propre base MySQL.
4. **Doctor Service** (8082) — Gère les médecins et leurs disponibilités.
5. **Appointment Service** (8083) — Service d'orchestration. Communique avec Patient Service et Doctor Service pour valider les rendez-vous.
6. **Consultation Service** (8084) — Stocke les dossiers médicaux.

### Concepts JEE2 démontrés

**1. Service Discovery avec Eureka**
> "Chaque service s'enregistre au démarrage. Quand le Appointment Service appelle Patient Service, il ne connaît pas son IP — Eureka lui donne dynamiquement l'adresse."

**2. API Gateway**
> "Le frontend ne connaît qu'une seule URL : http://localhost:8080. La Gateway route /api/patients vers Patient Service, /api/doctors vers Doctor Service, etc."

**3. Communication inter-services avec OpenFeign**
> "Au lieu d'écrire du code HTTP manuellement, on déclare une interface annotée @FeignClient. Spring génère le client HTTP automatiquement."

```java
@FeignClient(name = "PATIENT-SERVICE")
public interface PatientClient {
    @GetMapping("/api/patients/{id}")
    PatientModel getPatientById(@PathVariable Long id);
}
```

**4. Champ @Transient — Enrichissement des données**
> "Le service de rendez-vous stocke seulement patientId et doctorId. Les noms sont récupérés en temps réel via Feign et placés dans des champs @Transient (non persistés)."

**5. Tolérance aux pannes avec Resilience4j**
> "Si Patient Service tombe, Appointment Service ne plante pas. Il retourne une réponse contrôlée HTTP 503 grâce au circuit breaker."

### Script de démonstration (10 minutes)

| Minute | Action |
|--------|--------|
| 0-1 | Ouvrir http://localhost:8761 — montrer tous les services enregistrés |
| 1-2 | Faire GET http://localhost:8080/api/patients via Swagger ou Postman |
| 2-4 | Créer un rendez-vous — montrer l'appel Feign dans les logs |
| 4-5 | Montrer la réponse JSON avec patientName et doctorName (champs @Transient) |
| 5-7 | Arrêter Patient Service — créer un rendez-vous — montrer le message d'erreur contrôlé |
| 7-8 | Redémarrer Patient Service — recréer le rendez-vous — succès |
| 8-9 | Montrer Swagger UI à http://localhost:8081/swagger-ui.html |
| 9-10 | Montrer le frontend React — Dashboard, liste des patients, création d'un rendez-vous |
