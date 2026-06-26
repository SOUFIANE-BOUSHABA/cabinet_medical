package com.pt28.cabinetmedical.document;

import com.pt28.cabinetmedical.common.exception.BusinessRuleException;
import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import com.pt28.cabinetmedical.common.exception.ResourceNotFoundException;
import com.pt28.cabinetmedical.document.dto.DocumentResponse;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecord;
import com.pt28.cabinetmedical.medicalrecord.MedicalRecordRepository;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
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
    public DocumentResponse getById(Long id, AuthPrincipal principal) {
        Document document = findEntity(id);
        enforceDocumentOwnership(document, principal);
        return DocumentMapper.toResponse(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getByRecord(Long recordId, AuthPrincipal principal) {
        enforceRecordOwnership(recordId, principal);
        return documentRepository.findByMedicalRecordIdOrderByUploadedAtDesc(recordId).stream()
                .map(DocumentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getMyDocuments(AuthPrincipal principal) {
        MedicalRecord record = medicalRecordRepository.findByPatientId(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("No medical record found for the current patient"));
        return getByRecord(record.getId(), principal);
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> download(Long id, AuthPrincipal principal) {
        Document document = findEntity(id);
        enforceDocumentOwnership(document, principal);
        Path path = Paths.get(document.getFilePath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Document file", id);
        }
        Resource resource;
        try {
            resource = new UrlResource(path.toUri());
        } catch (MalformedURLException e) {
            throw new BusinessRuleException("Failed to read document file");
        }
        if (!resource.exists() || !resource.isReadable()) {
            throw new ResourceNotFoundException("Document file", id);
        }
        String contentType = document.getFileType() != null
                ? document.getFileType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
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

    private void enforceRecordOwnership(Long recordId, AuthPrincipal principal) {
        if (!principal.isPatient()) {
            return;
        }
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", recordId));
        if (record.getPatient() == null || !principal.id().equals(record.getPatient().getId())) {
            throw new ForbiddenAccessException("You are not allowed to access another patient's documents");
        }
    }

    private void enforceDocumentOwnership(Document document, AuthPrincipal principal) {
        if (!principal.isPatient()) {
            return;
        }
        MedicalRecord record = document.getMedicalRecord();
        if (record == null || record.getPatient() == null || !principal.id().equals(record.getPatient().getId())) {
            throw new ForbiddenAccessException("You are not allowed to access this document");
        }
    }
}
