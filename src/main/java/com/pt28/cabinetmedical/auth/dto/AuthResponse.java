package com.pt28.cabinetmedical.auth.dto;

import com.pt28.cabinetmedical.security.PrincipalType;
import com.pt28.cabinetmedical.user.Role;

public record AuthResponse(
        String tokenType,
        String accessToken,
        String refreshToken,
        long expiresInSeconds,
        Long id,
        String username,
        String displayName,
        Role role,
        PrincipalType principalType
) {
}
