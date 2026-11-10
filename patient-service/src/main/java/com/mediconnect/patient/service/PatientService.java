package com.mediconnect.patient.service;

import com.mediconnect.patient.entity.Patient;

import java.util.List;

/**
 * Patient service interface - defines business operations for patient management.
 */
public interface PatientService {

    List<Patient> getAllPatients();

    Patient getPatientById(Long id);

    Patient createPatient(Patient patient);

    Patient updatePatient(Long id, Patient patient);

    void deletePatient(Long id);

    Patient getPatientByEmail(String email);

    List<Patient> searchPatients(String keyword);
}
