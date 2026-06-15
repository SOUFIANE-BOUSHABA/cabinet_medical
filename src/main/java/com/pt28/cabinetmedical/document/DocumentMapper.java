package com.pt28.cabinetmedical.document;

import com.pt28.cabinetmedical.document.dto.DocumentResponse;

public final class DocumentMapper {

    private DocumentMapper() {
    }

    public static DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getMedicalRecord() != null ? document.getMedicalRecord().getId() : null,
                document.getFileName(),
                document.getFilePath(),
                document.getFileType(),
                document.getUploadedAt()
        );
    }
}
