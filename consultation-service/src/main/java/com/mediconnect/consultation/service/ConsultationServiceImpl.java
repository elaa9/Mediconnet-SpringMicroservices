package com.mediconnect.consultation.service;

import com.mediconnect.consultation.entity.Consultation;
import com.mediconnect.consultation.exception.ConsultationNotFoundException;
import com.mediconnect.consultation.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Consultation> getAllConsultations() {
        return consultationRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Consultation getConsultationById(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ConsultationNotFoundException("Consultation not found with id: " + id));
    }

    @Override
    public Consultation createConsultation(Consultation consultation) {
        log.info("Creating consultation for appointment id: {}", consultation.getAppointmentId());
        return consultationRepository.save(consultation);
    }

    @Override
    public Consultation updateConsultation(Long id, Consultation updatedConsultation) {
        Consultation existing = consultationRepository.findById(id)
                .orElseThrow(() -> new ConsultationNotFoundException("Consultation not found with id: " + id));

        existing.setDiagnosis(updatedConsultation.getDiagnosis());
        existing.setPrescription(updatedConsultation.getPrescription());
        existing.setNotes(updatedConsultation.getNotes());
        existing.setConsultationDate(updatedConsultation.getConsultationDate());

        return consultationRepository.save(existing);
    }

    @Override
    public void deleteConsultation(Long id) {
        if (!consultationRepository.existsById(id)) {
            throw new ConsultationNotFoundException("Consultation not found with id: " + id);
        }
        consultationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Consultation> getConsultationsByPatient(Long patientId) {
        return consultationRepository.findByPatientIdOrderByConsultationDateDesc(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Consultation> getConsultationsByDoctor(Long doctorId) {
        return consultationRepository.findByDoctorId(doctorId);
    }

    @Override
    @Transactional(readOnly = true)
    public Consultation getConsultationByAppointment(Long appointmentId) {
        return consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ConsultationNotFoundException(
                        "No consultation found for appointment id: " + appointmentId));
    }
}
