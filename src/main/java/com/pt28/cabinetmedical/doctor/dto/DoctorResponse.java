package com.pt28.cabinetmedical.doctor.dto;

public record DoctorResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String specialty,
        String availability
) {
}
