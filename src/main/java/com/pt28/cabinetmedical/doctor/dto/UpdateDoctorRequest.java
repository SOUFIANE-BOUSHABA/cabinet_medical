package com.pt28.cabinetmedical.doctor.dto;

import jakarta.validation.constraints.Size;

public record UpdateDoctorRequest(
        @Size(max = 150) String name,
        @Size(max = 150) String specialty,
        @Size(max = 255) String availability
) {
}
