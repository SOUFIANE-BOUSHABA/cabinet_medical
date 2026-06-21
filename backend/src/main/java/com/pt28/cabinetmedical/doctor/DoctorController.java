package com.pt28.cabinetmedical.doctor;

import com.pt28.cabinetmedical.common.response.PageResponse;
import com.pt28.cabinetmedical.doctor.dto.CreateDoctorRequest;
import com.pt28.cabinetmedical.doctor.dto.DoctorResponse;
import com.pt28.cabinetmedical.doctor.dto.UpdateDoctorRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/doctors")
@Tag(name = "Doctors", description = "Doctor profiles")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "List doctors")
    public PageResponse<DoctorResponse> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getAll(pageable), Function.identity());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Get a doctor by id")
    public DoctorResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a doctor (ADMIN only)")
    public DoctorResponse create(@Valid @RequestBody CreateDoctorRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a doctor")
    public DoctorResponse update(@PathVariable Long id, @Valid @RequestBody UpdateDoctorRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a doctor")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
