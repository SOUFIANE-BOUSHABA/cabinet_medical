package com.pt28.cabinetmedical.medicalrecord;

import com.pt28.cabinetmedical.common.response.PageResponse;
import com.pt28.cabinetmedical.medicalrecord.dto.CreateMedicalRecordRequest;
import com.pt28.cabinetmedical.medicalrecord.dto.MedicalRecordResponse;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/medical-records")
@Tag(name = "Medical Records", description = "Digital medical records")
public class MedicalRecordController {

    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List medical records (staff)")
    public PageResponse<MedicalRecordResponse> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getAll(pageable), Function.identity());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get my medical record (patient)")
    public MedicalRecordResponse getMine(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.getMyRecord(principal);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Get a medical record by id")
    public MedicalRecordResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthPrincipal principal) {
        return service.getById(id, principal);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Get a patient's medical record")
    public MedicalRecordResponse getByPatient(@PathVariable Long patientId, @AuthenticationPrincipal AuthPrincipal principal) {
        return service.getByPatientId(patientId, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Create a medical record for a patient")
    public MedicalRecordResponse create(@Valid @RequestBody CreateMedicalRecordRequest request) {
        return service.create(request);
    }
}
