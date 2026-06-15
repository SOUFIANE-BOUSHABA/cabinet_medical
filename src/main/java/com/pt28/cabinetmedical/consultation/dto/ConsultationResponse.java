package com.pt28.cabinetmedical.consultation.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ConsultationResponse(
        Long id,
        Long medicalRecordId,
        Long doctorId,
        String doctorName,
        LocalDate consultationDate,
        String diagnosis,
        String notes,
        String treatment,
        LocalDateTime createdAt
) {
}
