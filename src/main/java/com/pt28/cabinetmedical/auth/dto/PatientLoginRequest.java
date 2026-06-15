package com.pt28.cabinetmedical.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record PatientLoginRequest(
        @NotBlank String cin,
        @NotBlank String password
) {
}
