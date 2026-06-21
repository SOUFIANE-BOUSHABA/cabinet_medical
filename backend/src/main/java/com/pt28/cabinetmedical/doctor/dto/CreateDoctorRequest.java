package com.pt28.cabinetmedical.doctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Creates a DOCTOR staff account and its doctor profile in one call. */
public record CreateDoctorRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        @Size(max = 150) String specialty,
        @Size(max = 255) String availability
) {
}
