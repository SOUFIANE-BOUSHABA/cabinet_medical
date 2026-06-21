package com.pt28.cabinetmedical.patient.dto;

import com.pt28.cabinetmedical.patient.AccountStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Public patient view — never exposes the password hash. */
public record PatientResponse(
        Long id,
        String cin,
        String firstName,
        String lastName,
        String phone,
        String email,
        LocalDate birthDate,
        String address,
        String gender,
        AccountStatus accountStatus,
        LocalDateTime createdAt,
        LocalDateTime approvedAt
) {
}
