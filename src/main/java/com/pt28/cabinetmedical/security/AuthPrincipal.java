package com.pt28.cabinetmedical.security;

import com.pt28.cabinetmedical.user.Role;

/**
 * The authenticated principal stored in the {@code SecurityContext}.
 *
 * @param id        the staff user id (STAFF) or the patient id (PATIENT)
 * @param username  email (STAFF) or CIN (PATIENT)
 * @param role      the role granted to this principal
 * @param type      whether this principal authenticated through the staff or the patient flow
 */
public record AuthPrincipal(Long id, String username, Role role, PrincipalType type) {

    public boolean isPatient() {
        return type == PrincipalType.PATIENT;
    }

    public boolean isStaff() {
        return type == PrincipalType.STAFF;
    }

    public boolean hasRole(Role other) {
        return this.role == other;
    }
}
