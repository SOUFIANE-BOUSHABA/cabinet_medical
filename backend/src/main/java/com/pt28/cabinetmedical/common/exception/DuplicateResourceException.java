package com.pt28.cabinetmedical.common.exception;

/** Thrown on a unique-constraint violation (duplicate CIN, duplicate email...). Mapped to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
