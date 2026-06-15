package com.pt28.cabinetmedical.common.exception;

/** Thrown when an appointment slot overlaps an existing one. Mapped to HTTP 409. */
public class AppointmentConflictException extends RuntimeException {

    public AppointmentConflictException(String message) {
        super(message);
    }
}
