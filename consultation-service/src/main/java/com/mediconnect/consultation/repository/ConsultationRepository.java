package com.mediconnect.consultation.repository;

import com.mediconnect.consultation.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientId(Long patientId);

    List<Consultation> findByDoctorId(Long doctorId);

    Optional<Consultation> findByAppointmentId(Long appointmentId);

    List<Consultation> findByPatientIdOrderByConsultationDateDesc(Long patientId);
}
