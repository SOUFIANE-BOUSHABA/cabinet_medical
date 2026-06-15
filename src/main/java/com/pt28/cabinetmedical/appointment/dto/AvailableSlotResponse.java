package com.pt28.cabinetmedical.appointment.dto;

import java.time.LocalTime;

public record AvailableSlotResponse(
        LocalTime startTime,
        LocalTime endTime
) {
}
