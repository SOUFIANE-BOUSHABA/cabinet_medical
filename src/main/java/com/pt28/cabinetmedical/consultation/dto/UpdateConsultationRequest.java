package com.pt28.cabinetmedical.consultation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

public record UpdateConsultationRequest(
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate consultationDate,
        @Size(max = 1000) String diagnosis,
        @Size(max = 2000) String notes,
        @Size(max = 2000) String treatment
) {
}
