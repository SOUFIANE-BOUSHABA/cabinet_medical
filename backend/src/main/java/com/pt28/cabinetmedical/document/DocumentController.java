package com.pt28.cabinetmedical.document;

import com.pt28.cabinetmedical.document.dto.DocumentResponse;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "Documents", description = "Simple files attached to medical records")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService service) {
        this.service = service;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Upload a document to a medical record")
    public DocumentResponse upload(@RequestParam("recordId") Long recordId,
                                   @RequestParam("file") MultipartFile file) {
        return service.upload(recordId, file);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "List documents of the current patient's medical record")
    public List<DocumentResponse> getMine(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.getMyDocuments(principal);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Get document metadata by id")
    public DocumentResponse getById(@PathVariable Long id,
                                    @AuthenticationPrincipal AuthPrincipal principal) {
        return service.getById(id, principal);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Download a document file")
    public ResponseEntity<Resource> download(@PathVariable Long id,
                                             @AuthenticationPrincipal AuthPrincipal principal) {
        return service.download(id, principal);
    }

    @GetMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "List documents of a medical record")
    public List<DocumentResponse> getByRecord(@PathVariable Long recordId,
                                              @AuthenticationPrincipal AuthPrincipal principal) {
        return service.getByRecord(recordId, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Delete a document")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
