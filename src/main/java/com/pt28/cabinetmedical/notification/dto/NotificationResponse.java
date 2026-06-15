package com.pt28.cabinetmedical.notification.dto;

import com.pt28.cabinetmedical.notification.NotificationChannel;
import com.pt28.cabinetmedical.notification.NotificationStatus;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long appointmentId,
        NotificationChannel channel,
        String recipient,
        String message,
        NotificationStatus status,
        LocalDateTime sentAt
) {
}
