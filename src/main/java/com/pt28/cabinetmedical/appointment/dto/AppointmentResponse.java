package com.pt28.cabinetmedical.appointment.dto;

import com.pt28.cabinetmedical.appointment.AppointmentStatus;
import com.pt28.cabinetmedical.appointment.AppointmentType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AppointmentResponse(
        Long id,
        Long patientId,
        String patientName,
        Long doctorId,
        String doctorName,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String reason,
        AppointmentStatus status,
        AppointmentType type,
        boolean isUrgent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
