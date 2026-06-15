package com.pt28.cabinetmedical.consultation;

import com.pt28.cabinetmedical.consultation.dto.ConsultationResponse;
import com.pt28.cabinetmedical.consultation.dto.CreateConsultationRequest;
import com.pt28.cabinetmedical.consultation.dto.UpdateConsultationRequest;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/consultations")
@Tag(name = "Consultations", description = "Medical consultations (created by doctors)")
public class ConsultationController {

    private final ConsultationService service;

    public ConsultationController(ConsultationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create a consultation (DOCTOR only)")
    public ConsultationResponse create(@Valid @RequestBody CreateConsultationRequest request,
                                       @AuthenticationPrincipal AuthPrincipal principal) {
        return service.create(request, principal);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Get a consultation by id")
    public ConsultationResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/record/{recordId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List consultations of a medical record")
    public List<ConsultationResponse> getByRecord(@PathVariable Long recordId) {
        return service.getByRecord(recordId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update a consultation (DOCTOR only)")
    public ConsultationResponse update(@PathVariable Long id,
                                       @Valid @RequestBody UpdateConsultationRequest request,
                                       @AuthenticationPrincipal AuthPrincipal principal) {
        return service.update(id, request, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    @Operation(summary = "Delete a consultation")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
