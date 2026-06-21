package com.pt28.cabinetmedical.patient;

import com.pt28.cabinetmedical.patient.dto.PatientResponse;

public final class PatientMapper {

    private PatientMapper() {
    }

    public static PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getCin(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getBirthDate(),
                patient.getAddress(),
                patient.getGender(),
                patient.getAccountStatus(),
                patient.getCreatedAt(),
                patient.getApprovedAt()
        );
    }
}
