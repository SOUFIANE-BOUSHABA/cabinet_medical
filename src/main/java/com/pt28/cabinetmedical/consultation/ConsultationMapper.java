package com.pt28.cabinetmedical.consultation;

import com.pt28.cabinetmedical.consultation.dto.ConsultationResponse;
import com.pt28.cabinetmedical.doctor.Doctor;

public final class ConsultationMapper {

    private ConsultationMapper() {
    }

    public static ConsultationResponse toResponse(Consultation consultation) {
        Doctor doctor = consultation.getDoctor();
        String doctorName = (doctor != null && doctor.getUser() != null) ? doctor.getUser().getName() : null;
        return new ConsultationResponse(
                consultation.getId(),
                consultation.getMedicalRecord() != null ? consultation.getMedicalRecord().getId() : null,
                doctor != null ? doctor.getId() : null,
                doctorName,
                consultation.getConsultationDate(),
                consultation.getDiagnosis(),
                consultation.getNotes(),
                consultation.getTreatment(),
                consultation.getCreatedAt()
        );
    }
}
