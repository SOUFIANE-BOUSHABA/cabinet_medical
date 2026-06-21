package com.pt28.cabinetmedical.settings.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record UpdateSettingsRequest(
        @NotNull @Min(1) @Max(500) Integer dailyAppointmentLimit,
        @NotNull LocalTime openingTime,
        @NotNull LocalTime closingTime,
        @NotNull @Min(5) @Max(240) Integer appointmentDuration
) {
}
