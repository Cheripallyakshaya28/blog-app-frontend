package com.blogapp.security;

import com.blogapp.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.Optional;

@Service
public class JwtService {

    public static final String COOKIE_NAME = "token";
    private static final long ONE_HOUR_MS = 60L * 60L * 1000L;

    private final SecretKey key;

    public JwtService(@Value("${app.jwt.secret}") String secret) {
        this.key = deriveKey(secret);
    }

    // Hash the secret so any SECRET_KEY length works (HS256 needs >= 256 bits)
    private static SecretKey deriveKey(String secret) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    public String generate(User user) {
        Date now = new Date();
        JwtBuilder builder = Jwts.builder()
                .claim("id", String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .claim("firstName", user.getFirstName());
        if (user.getProfileImageUrl() != null) {
            builder.claim("profileImageUrl", user.getProfileImageUrl());
        }
        return builder
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ONE_HOUR_MS))
                .signWith(key)
                .compact();
    }

    /** Throws a JwtException (or IllegalArgumentException) if the token is invalid/expired. */
    public AuthUser parse(String token) {
        Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        long iat = c.getIssuedAt() == null ? 0 : c.getIssuedAt().getTime() / 1000;
        long exp = c.getExpiration() == null ? 0 : c.getExpiration().getTime() / 1000;
        return new AuthUser(
                Long.valueOf(c.get("id", String.class)),
                c.get("email", String.class),
                c.get("role", String.class),
                c.get("firstName", String.class),
                c.get("profileImageUrl", String.class),
                iat,
                exp);
    }

    public String tokenFrom(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /** For public endpoints that behave differently when someone happens to be logged in. */
    public Optional<AuthUser> optionalUser(HttpServletRequest request) {
        String token = tokenFrom(request);
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        try {
            return Optional.of(parse(token));
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
