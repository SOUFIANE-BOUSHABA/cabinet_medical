package com.pt28.cabinetmedical.user.dto;

import com.pt28.cabinetmedical.user.Role;

import java.time.LocalDateTime;

/** Public user view — never exposes the password. */
public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        boolean enabled,
        LocalDateTime createdAt
) {
}
