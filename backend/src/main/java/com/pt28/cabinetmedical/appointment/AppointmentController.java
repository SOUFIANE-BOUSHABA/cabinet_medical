package com.pt28.cabinetmedical.appointment;

import com.pt28.cabinetmedical.appointment.dto.*;
import com.pt28.cabinetmedical.common.response.PageResponse;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/appointments")
@Tag(name = "Appointments", description = "Appointment requests, scheduling and status workflow")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping("/request")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Patient requests a normal appointment")
    public AppointmentResponse request(@Valid @RequestBody PatientAppointmentRequest request,
                                       @AuthenticationPrincipal AuthPrincipal principal) {
        return service.requestByPatient(request, principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Staff creates a normal appointment")
    public AppointmentResponse create(@Valid @RequestBody CreateAppointmentRequest request) {
        return service.createByStaff(request);
    }

    @PostMapping("/urgent")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Staff creates an urgent appointment (patients are not allowed)")
    public AppointmentResponse createUrgent(@Valid @RequestBody UrgentAppointmentRequest request) {
        return service.createUrgent(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List / filter appointments by status and date")
    public PageResponse<AppointmentResponse> getAll(
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getAll(status, date, pageable), Function.identity());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Patient lists their own appointments")
    public PageResponse<AppointmentResponse> getMine(@AuthenticationPrincipal AuthPrincipal principal,
                                                     @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getMine(principal, pageable), Function.identity());
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List a doctor's appointments")
    public PageResponse<AppointmentResponse> getByDoctor(@PathVariable Long doctorId,
                                                         @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getByDoctor(doctorId, pageable), Function.identity());
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List appointments for a given day")
    public PageResponse<AppointmentResponse> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PageableDefault(size = 50) Pageable pageable) {
        return PageResponse.of(service.getByDate(date, pageable), Function.identity());
    }

    @GetMapping("/available-slots")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Available slots for a doctor on a date")
    public List<AvailableSlotResponse> availableSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.getAvailableSlots(doctorId, date);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY','PATIENT')")
    @Operation(summary = "Get an appointment by id")
    public AppointmentResponse getById(@PathVariable Long id, @AuthenticationPrincipal AuthPrincipal principal) {
        return service.getById(id, principal);
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Confirm an appointment")
    public AppointmentResponse confirm(@PathVariable Long id) {
        return service.confirm(id);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY','PATIENT')")
    @Operation(summary = "Cancel an appointment (a patient may only cancel their own)")
    public AppointmentResponse cancel(@PathVariable Long id, @AuthenticationPrincipal AuthPrincipal principal) {
        return service.cancel(id, principal);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Mark an appointment as completed")
    public AppointmentResponse complete(@PathVariable Long id) {
        return service.complete(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Reschedule / edit an appointment")
    public AppointmentResponse update(@PathVariable Long id, @Valid @RequestBody UpdateAppointmentRequest request) {
        return service.update(id, request);
    }
}
