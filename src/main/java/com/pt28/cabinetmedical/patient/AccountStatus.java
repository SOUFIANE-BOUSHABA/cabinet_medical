package com.pt28.cabinetmedical.patient;

/**
 * Patient account lifecycle status.
 *
 * <p>The UML diagram uses ACTIVE / REFUSE; per the prompt and cahier des charges the values are
 * PENDING / APPROVED / REJECTED. See README, "Conflict resolution & decisions".
 */
public enum AccountStatus {
    PENDING,
    APPROVED,
    REJECTED
}
