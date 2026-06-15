package com.pt28.cabinetmedical.notification;

import com.pt28.cabinetmedical.notification.dto.NotificationResponse;

public final class NotificationMapper {

    private NotificationMapper() {
    }

    public static NotificationResponse toResponse(Notification notification) {
        Long appointmentId = notification.getAppointment() != null ? notification.getAppointment().getId() : null;
        return new NotificationResponse(
                notification.getId(),
                appointmentId,
                notification.getChannel(),
                notification.getRecipient(),
                notification.getMessage(),
                notification.getStatus(),
                notification.getSentAt()
        );
    }
}
