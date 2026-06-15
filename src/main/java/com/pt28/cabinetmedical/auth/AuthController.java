package com.pt28.cabinetmedical.auth;

import com.pt28.cabinetmedical.auth.dto.*;
import com.pt28.cabinetmedical.patient.dto.PatientResponse;
import com.pt28.cabinetmedical.patient.dto.RegisterPatientRequest;
import com.pt28.cabinetmedical.security.AuthPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Staff & patient login, patient registration, current user")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/staff/login")
    @Operation(summary = "Staff login (email + password)")
    public AuthResponse staffLogin(@Valid @RequestBody StaffLoginRequest request) {
        return service.staffLogin(request);
    }

    @PostMapping("/patient/login")
    @Operation(summary = "Patient login (CIN + password)")
    public AuthResponse patientLogin(@Valid @RequestBody PatientLoginRequest request) {
        return service.patientLogin(request);
    }

    @PostMapping("/patient/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Patient self-registration (account starts PENDING)")
    public PatientResponse register(@Valid @RequestBody RegisterPatientRequest request) {
        return service.register(request);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Exchange a refresh token for a new access token")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return service.refresh(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get the currently authenticated user")
    public MeResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.me(principal);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Logout (stateless — the client simply discards the token)")
    public void logout() {
        // With stateless JWT there is no server-side session to invalidate.
        // Provided for API completeness; clients should discard their tokens.
    }
}
