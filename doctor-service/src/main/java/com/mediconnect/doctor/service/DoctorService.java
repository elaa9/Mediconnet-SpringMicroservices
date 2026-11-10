package com.mediconnect.doctor.service;

import com.mediconnect.doctor.entity.Doctor;

import java.util.List;

public interface DoctorService {
    List<Doctor> getAllDoctors();
    Doctor getDoctorById(Long id);
    Doctor createDoctor(Doctor doctor);
    Doctor updateDoctor(Long id, Doctor doctor);
    void deleteDoctor(Long id);
    List<Doctor> getDoctorsBySpecialization(String specialization);
    List<Doctor> getAvailableDoctors();
    List<Doctor> searchDoctors(String keyword);
}
