package com.pt28.cabinetmedical.common.exception;

/** Thrown when the daily appointment limit for the cabinet has been reached. Mapped to HTTP 409. */
public class DailyLimitReachedException extends RuntimeException {

    public DailyLimitReachedException(String message) {
        super(message);
    }
}
