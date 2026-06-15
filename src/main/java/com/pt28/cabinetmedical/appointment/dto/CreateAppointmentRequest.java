package com.pt28.cabinetmedical.appointment.dto;

import com.pt28.cabinetmedical.appointment.AppointmentStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

/** Staff-created NORMAL appointment (POST /appointments). */
public record CreateAppointmentRequest(
        @NotNull Long patientId,
        @NotNull Long doctorId,
        @NotNull @FutureOrPresent @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
        @Size(max = 500) String reason,
        /** Optional initial status; defaults to CONFIRMED when omitted. */
        AppointmentStatus status
) {
}
