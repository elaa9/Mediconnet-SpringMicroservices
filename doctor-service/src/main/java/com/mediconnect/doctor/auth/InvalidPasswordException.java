package com.mediconnect.doctor.auth;

public class InvalidPasswordException extends RuntimeException {
    public InvalidPasswordException() {
        super("Password must be between 8 and 72 UTF-8 bytes");
    }
}
