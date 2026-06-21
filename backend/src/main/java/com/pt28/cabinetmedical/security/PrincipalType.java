package com.pt28.cabinetmedical.security;

/** Distinguishes the two authentication flows: cabinet staff vs. external patient. */
public enum PrincipalType {
    STAFF,
    PATIENT
}
