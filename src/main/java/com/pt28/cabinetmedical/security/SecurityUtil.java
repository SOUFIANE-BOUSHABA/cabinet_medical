package com.pt28.cabinetmedical.security;

import com.pt28.cabinetmedical.common.exception.ForbiddenAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Convenience accessors for the currently authenticated {@link AuthPrincipal}. */
public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static AuthPrincipal getCurrentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthPrincipal principal)) {
            throw new ForbiddenAccessException("No authenticated user found in the security context");
        }
        return principal;
    }
}
