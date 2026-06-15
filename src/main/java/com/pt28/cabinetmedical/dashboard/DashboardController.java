package com.pt28.cabinetmedical.dashboard;

import com.pt28.cabinetmedical.dashboard.dto.AdminDashboardResponse;
import com.pt28.cabinetmedical.dashboard.dto.DoctorDashboardResponse;
import com.pt28.cabinetmedical.dashboard.dto.PatientDashboardResponse;
import com.pt28.cabinetmedical.dashboard.dto.SecretaryDashboardResponse;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboards", description = "Role-specific statistics")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Administrator dashboard")
    public AdminDashboardResponse admin() {
        return service.admin();
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Doctor dashboard")
    public DoctorDashboardResponse doctor(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.doctor(principal);
    }

    @GetMapping("/secretary")
    @PreAuthorize("hasAnyRole('ADMIN','SECRETARY')")
    @Operation(summary = "Secretary dashboard")
    public SecretaryDashboardResponse secretary() {
        return service.secretary();
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Patient dashboard")
    public PatientDashboardResponse patient(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.patient(principal);
    }
}
