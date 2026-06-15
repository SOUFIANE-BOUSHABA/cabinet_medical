package com.pt28.cabinetmedical.medicalrecord.dto;

import jakarta.validation.constraints.NotNull;

public record CreateMedicalRecordRequest(
        @NotNull Long patientId
) {
}
