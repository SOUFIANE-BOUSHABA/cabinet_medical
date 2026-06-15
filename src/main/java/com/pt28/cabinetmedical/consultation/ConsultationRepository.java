package com.pt28.cabinetmedical.consultation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByMedicalRecordIdOrderByConsultationDateDesc(Long medicalRecordId);

    long countByDoctorId(Long doctorId);
}
