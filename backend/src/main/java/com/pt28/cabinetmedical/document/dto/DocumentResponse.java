package com.pt28.cabinetmedical.document.dto;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        Long medicalRecordId,
        String fileName,
        String filePath,
        String fileType,
        LocalDateTime uploadedAt
) {
}
