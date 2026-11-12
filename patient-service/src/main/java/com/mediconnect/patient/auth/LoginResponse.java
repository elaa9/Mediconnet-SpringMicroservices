package com.mediconnect.patient.auth;

public record LoginResponse(Long id, String role, String name, String email) {
}
