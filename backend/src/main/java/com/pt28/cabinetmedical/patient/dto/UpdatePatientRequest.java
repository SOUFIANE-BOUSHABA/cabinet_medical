package com.pt28.cabinetmedical.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Update form. Staff may update every field; a patient updating their own record may only change
 * phone / email / address (business rule 7.6 — patients cannot edit their medical/identity data).
 */
public record UpdatePatientRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @Size(max = 30) String phone,
        @Email @Size(max = 180) String email,
        @Past @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate birthDate,
        @Size(max = 255) String address,
        @Size(max = 20) String gender
) {
}
