package com.pt28.cabinetmedical.notification.dto;

import com.pt28.cabinetmedical.notification.NotificationChannel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SimulateNotificationRequest(
        Long appointmentId,
        @NotNull NotificationChannel channel,
        String recipient,
        @NotBlank String message
) {
}
