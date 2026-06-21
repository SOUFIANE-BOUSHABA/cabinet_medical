package com.pt28.cabinetmedical.document;

import com.pt28.cabinetmedical.document.dto.DocumentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Get document metadata by id")
    public DocumentResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List documents of a medical record")
    public List<DocumentResponse> getByRecord(@PathVariable Long recordId) {
        return service.getByRecord(recordId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Delete a document")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
