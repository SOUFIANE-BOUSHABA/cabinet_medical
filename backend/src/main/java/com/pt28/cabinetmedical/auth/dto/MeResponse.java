package com.pt28.cabinetmedical.auth.dto;

import com.pt28.cabinetmedical.security.PrincipalType;
import com.pt28.cabinetmedical.user.Role;

public record MeResponse(
        Long id,
        String username,
        String displayName,
        String email,
        Role role,
        PrincipalType principalType
) {
}
