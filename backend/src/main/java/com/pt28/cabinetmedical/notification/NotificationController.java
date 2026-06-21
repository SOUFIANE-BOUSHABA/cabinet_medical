package com.pt28.cabinetmedical.notification;

import com.pt28.cabinetmedical.common.response.PageResponse;
import com.pt28.cabinetmedical.notification.dto.NotificationResponse;
import com.pt28.cabinetmedical.notification.dto.SimulateNotificationRequest;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.function.Function;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Notification history (simulated WhatsApp / email)")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "List all notifications (staff)")
    public PageResponse<NotificationResponse> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getAll(pageable), Function.identity());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "List my notifications (patient)")
    public PageResponse<NotificationResponse> getMine(@AuthenticationPrincipal AuthPrincipal principal,
                                                      @PageableDefault(size = 20) Pageable pageable) {
        return PageResponse.of(service.getForPatient(principal.id(), pageable), Function.identity());
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "List notifications for an appointment")
    public List<NotificationResponse> getByAppointment(@PathVariable Long appointmentId) {
        return service.getByAppointment(appointmentId);
    }

    @PostMapping("/simulate")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','SECRETARY')")
    @Operation(summary = "Simulate sending a notification")
    public NotificationResponse simulate(@Valid @RequestBody SimulateNotificationRequest request) {
        return service.simulate(request);
    }
}
