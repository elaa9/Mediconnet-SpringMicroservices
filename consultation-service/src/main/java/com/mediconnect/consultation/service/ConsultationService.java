package com.mediconnect.consultation.service;

import com.mediconnect.consultation.entity.Consultation;

import java.util.List;

public interface ConsultationService {
    List<Consultation> getAllConsultations();
    Consultation getConsultationById(Long id);
    Consultation createConsultation(Consultation consultation);
    Consultation updateConsultation(Long id, Consultation consultation);
    void deleteConsultation(Long id);
    List<Consultation> getConsultationsByPatient(Long patientId);
    List<Consultation> getConsultationsByDoctor(Long doctorId);
    Consultation getConsultationByAppointment(Long appointmentId);
}
