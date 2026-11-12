package com.mediconnect.patient.service;

import com.mediconnect.patient.entity.Patient;
import com.mediconnect.patient.auth.LoginResponse;

import java.util.List;

/**
 * Patient service interface - defines business operations for patient management.
 */
public interface PatientService {

    List<Patient> getAllPatients();

    Patient getPatientById(Long id);

    Patient createPatient(Patient patient);

    LoginResponse authenticate(String email, String password);

    Patient updatePatient(Long id, Patient patient);

    void deletePatient(Long id);

    Patient getPatientByEmail(String email);

    List<Patient> searchPatients(String keyword);
}
