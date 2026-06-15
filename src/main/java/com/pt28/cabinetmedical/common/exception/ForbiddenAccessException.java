package com.pt28.cabinetmedical.common.exception;

/** Thrown when an authenticated user tries to access a resource they do not own. Mapped to HTTP 403. */
public class ForbiddenAccessException extends RuntimeException {

    public ForbiddenAccessException(String message) {
        super(message);
    }
}
