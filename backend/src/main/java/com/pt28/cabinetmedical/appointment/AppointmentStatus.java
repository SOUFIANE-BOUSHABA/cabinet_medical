package com.pt28.cabinetmedical.appointment;

/**
 * Appointment lifecycle status.
 *
 * <p>UML uses EN_ATTENTE / CONFIRME / ANNULE / TERMINE; the prompt mandates the English values.
 */
public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    CANCELLED,
    COMPLETED
}
