package com.blogapp.security;

import com.blogapp.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;

/** Enforces @RequireRole on controller methods (replaces VerifyToken.js). */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String USER_ATTR = "authUser";

    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true; // static resources, CORS pre-flight, etc.
        }
        RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
        if (requireRole == null) {
            return true; // public route
        }

        String token = jwtService.tokenFrom(request);
        if (token == null || token.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please login first");
        }

        AuthUser user;
        try {
            user = jwtService.parse(token);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        if (!Arrays.asList(requireRole.value()).contains(user.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized");
        }

        request.setAttribute(USER_ATTR, user);
        return true;
    }
}
