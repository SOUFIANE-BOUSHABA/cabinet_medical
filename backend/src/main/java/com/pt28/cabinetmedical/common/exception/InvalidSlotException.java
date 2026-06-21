package com.pt28.cabinetmedical.common.exception;

/** Thrown when an appointment slot is outside opening hours or otherwise invalid. Mapped to HTTP 400. */
public class InvalidSlotException extends RuntimeException {

    public InvalidSlotException(String message) {
        super(message);
    }
}
