package com.pt28.cabinetmedical.notification;

/**
 * Notification delivery status.
 *
 * <p>UML uses EN_ATTENTE / ENVOYE / ECHEC; the prompt mandates PENDING / SENT / FAILED.
 */
public enum NotificationStatus {
    PENDING,
    SENT,
    FAILED
}
