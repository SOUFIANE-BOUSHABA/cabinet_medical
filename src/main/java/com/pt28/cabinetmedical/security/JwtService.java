package com.pt28.cabinetmedical.security;

import com.pt28.cabinetmedical.user.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Creates and validates JWT access / refresh tokens. */
@Service
public class JwtService {

    private static final String CLAIM_ID = "id";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;
    private final String issuer;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-token-expiration-ms}") long refreshExpirationMs,
            @Value("${app.jwt.issuer}") String issuer) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        this.issuer = issuer;
    }

    public String generateAccessToken(AuthPrincipal principal) {
        return buildToken(principal, accessExpirationMs, "ACCESS");
    }

    public String generateRefreshToken(AuthPrincipal principal) {
        return buildToken(principal, refreshExpirationMs, "REFRESH");
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    private String buildToken(AuthPrincipal principal, long expirationMs, String tokenType) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .issuer(issuer)
                .subject(principal.username())
                .claim(CLAIM_ID, principal.id())
                .claim(CLAIM_ROLE, principal.role().name())
                .claim(CLAIM_TYPE, principal.type().name())
                .claim(CLAIM_TOKEN_TYPE, tokenType)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /** Parses and validates the token signature/expiry and rebuilds the principal. */
    public AuthPrincipal parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return new AuthPrincipal(
                claims.get(CLAIM_ID, Long.class),
                claims.getSubject(),
                Role.valueOf(claims.get(CLAIM_ROLE, String.class)),
                PrincipalType.valueOf(claims.get(CLAIM_TYPE, String.class))
        );
    }

    public boolean isRefreshToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return "REFRESH".equals(claims.get(CLAIM_TOKEN_TYPE, String.class));
    }
}
