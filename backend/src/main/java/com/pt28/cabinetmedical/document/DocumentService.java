package com.pt28.cabinetmedical.document;

import com.pt28.cabinetmedical.common.exception.BusinessRuleException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.document.dto.DocumentResponse;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecord;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final Path uploadRoot;

    public DocumentService(DocumentRepository documentRepository,
                           MedicalRecordRepository medicalRecordRepository,
                           @Value("${app.storage.upload-dir}") String uploadDir) {
        this.documentRepository = documentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Transactional
    public DocumentResponse upload(Long recordId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("Uploaded file is empty");
        }
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", recordId));

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "document" : file.getOriginalFilename());
        String storedName = UUID.randomUUID() + "_" + originalName;
        Path targetDir = uploadRoot.resolve("record_" + recordId);
        Path target = targetDir.resolve(storedName);
        try {
            Files.createDirectories(targetDir);
            file.transferTo(target);
        } catch (IOException e) {
            throw new BusinessRuleException("Failed to store file: " + e.getMessage());
        }

        Document document = documentRepository.save(Document.builder()
                .medicalRecord(record)
                .fileName(originalName)
                .filePath(target.toString())
                .fileType(file.getContentType())
                .build());
        return DocumentMapper.toResponse(document);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getById(Long id) {
        return DocumentMapper.toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByRecord(Long recordId) {
        return documentRepository.findByMedicalRecordIdOrderByUploadedAtDesc(recordId).stream()
                .map(DocumentMapper::toResponse)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        Document document = findEntity(id);
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (IOException ignored) {
            // The metadata is removed even if the physical file is already gone.
        }
        documentRepository.delete(document);
    }

    private Document findEntity(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", id));
    }
}
