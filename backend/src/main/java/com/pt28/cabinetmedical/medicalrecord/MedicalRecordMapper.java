package com.pt28.cabinetmedical.medicalrecord;

import com.pt28.cabinetmedical.medicalrecord.dto.MedicalRecordResponse;
import com.pt28.cabinetmedical.patient.Patient;

public final class MedicalRecordMapper {

    private MedicalRecordMapper() {
    }

    public static MedicalRecordResponse toResponse(MedicalRecord record) {
        Patient patient = record.getPatient();
        String name = patient != null ? patient.getFirstName() + " " + patient.getLastName() : null;
        return new MedicalRecordResponse(
                record.getId(),
                patient != null ? patient.getId() : null,
                name,
                patient != null ? patient.getCin() : null,
                record.getCreatedAt(),
                record.getUpdatedAt()
        );
    }
}
