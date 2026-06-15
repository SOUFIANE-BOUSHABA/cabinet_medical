package com.pt28.cabinetmedical.medicalrecord.dto;

import java.time.LocalDateTime;

public record MedicalRecordResponse(
        Long id,
        Long patientId,
        String patientName,
        String patientCin,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
