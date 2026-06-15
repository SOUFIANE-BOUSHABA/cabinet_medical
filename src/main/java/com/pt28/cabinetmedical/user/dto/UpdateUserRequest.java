package com.pt28.cabinetmedical.user.dto;

import com.pt28.cabinetmedical.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotNull Role role,
        /** Optional: when present, resets the password. */
        @Size(min = 6, max = 100) String password
) {
}
