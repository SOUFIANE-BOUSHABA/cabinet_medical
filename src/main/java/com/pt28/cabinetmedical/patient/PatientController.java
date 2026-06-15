package com.pt28.cabinetmedical.patient;

import com.pt28.cabinetmedical.common.response.PageResponse;
import com.pt28.cabinetmedical.patient.dto.CreatePatientRequest;
import com.pt28.cabinetmedical.patient.dto.PatientResponse;
import com.pt28.cabinetmedical.patient.dto.UpdatePatientRequest;
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
@RequestMapping("/api/v1/patients")
@Tag(name = "Patients", description = "Patient management, search, approval workflow")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List patients")
    public PageResponse<PatientResponse> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getAll(pageable), Function.identity());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Search patients by name, CIN or phone")
    public PageResponse<PatientResponse> search(@RequestParam(defaultValue = "") String keyword,
                                                @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.search(keyword, pageable), Function.identity());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "List patient accounts pending approval")
    public PageResponse<PatientResponse> getPending(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getPending(pageable), Function.identity());
    }

    @GetMapping("/by-cin/{cin}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Find a patient by CIN")
    public PatientResponse getByCin(@PathVariable String cin) {
        return service.getByCin(cin);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Get a patient by id (a patient may only access their own record)")
    public PatientResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthPrincipal principal) {
        return service.getById(id, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Create a patient (staff)")
    public PatientResponse create(@Valid @RequestBody CreatePatientRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY','PATIENT')")
    @Operation(summary = "Update a patient (a patient may only edit their own contact details)")
    public PatientResponse update(@PathVariable Long id,
                                  @Valid @RequestBody UpdatePatientRequest request,
                                  @AuthenticationPrincipal AuthPrincipal principal) {
        return service.update(id, request, principal);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Delete a patient")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Approve a pending patient account")
    public PatientResponse approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Reject a patient account")
    public PatientResponse reject(@PathVariable Long id) {
        return service.reject(id);
    }
}
