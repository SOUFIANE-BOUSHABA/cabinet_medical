package com.pt28.cabinetmedical.common.exception;

/** Generic business-rule violation. Mapped to HTTP 400. */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
