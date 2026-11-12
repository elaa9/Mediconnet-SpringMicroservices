package com.mediconnect.doctor.auth;

public record LoginResponse(Long id, String role, String name, String email) {
}
