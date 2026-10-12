package com.blogapp.security;

import java.util.LinkedHashMap;
import java.util.Map;

/** The logged-in user, decoded from the JWT cookie (same claims the Node version put in the token). */
public record AuthUser(Long id, String email, String role, String firstName,
                       String profileImageUrl, long iat, long exp) {

    public Map<String, Object> toPayload() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("email", email);
        m.put("role", role);
        m.put("firstName", firstName);
        m.put("profileImageUrl", profileImageUrl);
        m.put("iat", iat);
        m.put("exp", exp);
        return m;
    }
}
