package com.pt28.cabinetmedical.common.exception;

/** Thrown when a patient account is not APPROVED (PENDING / REJECTED) and tries to log in. Mapped to HTTP 403. */
public class AccountNotActiveException extends RuntimeException {

    public AccountNotActiveException(String message) {
        super(message);
    }
}
