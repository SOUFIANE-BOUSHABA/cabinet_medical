package com.pt28.cabinetmedical.settings.dto;

import java.time.LocalTime;

public record SettingsResponse(
        Long id,
        Integer dailyAppointmentLimit,
        LocalTime openingTime,
        LocalTime closingTime,
        Integer appointmentDuration
) {
}
