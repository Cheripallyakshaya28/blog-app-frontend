package com.blogapp.controller;

import com.blogapp.exception.ApiException;
import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import com.blogapp.security.AuthInterceptor;
import com.blogapp.security.AuthUser;
import com.blogapp.security.JwtService;
import com.blogapp.security.RequireRole;
import com.blogapp.service.CloudinaryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

/** Register, login, logout, check-auth, change password  (was CommonAPI.js, mounted at /auth) */
@RestController
@RequestMapping("/auth")
public class CommonController {

    public record LoginRequest(String email, String password) {}

    public record RegisterRequest(String role, String firstName, String lastName,
                                  String email, String password) {}

    public record PasswordRequest(String currentPassword, String newPassword) {}

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;
    private final JwtService jwtService;
    private final CloudinaryService cloudinaryService;
    private final boolean cookieSecure;
    private final String cookieSameSite;

    public CommonController(UserRepository userRepository,
                            BCryptPasswordEncoder encoder,
                            JwtService jwtService,
                            CloudinaryService cloudinaryService,
                            @Value("${app.cookie.secure}") boolean cookieSecure,
                            @Value("${app.cookie.same-site}") String cookieSameSite) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.cloudinaryService = cloudinaryService;
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    // ---------- REGISTER (multipart/form-data, used by the React form) ----------
    @PostMapping(value = "/users", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> registerMultipart(
            @RequestParam(name = "role", required = false) String role,
            @RequestParam(name = "firstName", required = false) String firstName,
            @RequestParam(name = "lastName", required = false) String lastName,
            @RequestParam(name = "email", required = false) String email,
            @RequestParam(name = "password", required = false) String password,
            @RequestParam(name = "profileImageUrl", required = false) MultipartFile file) {
        return register(role, firstName, lastName, email, password, file);
    }

    // ---------- REGISTER (plain JSON, used by the .http test files) ----------
    @PostMapping(value = "/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> registerJson(@RequestBody RegisterRequest r) {
        return register(r.role(), r.firstName(), r.lastName(), r.email(), r.password(), null);
    }

    private ResponseEntity<Map<String, Object>> register(String role, String firstName, String lastName,
                                                         String email, String password, MultipartFile file) {
        if (!"USER".equals(role) && !"AUTHOR".equals(role)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
        if (Responses.blank(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "email is required");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User already exists");
        }
        if (Responses.blank(firstName)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "First name is required");
        }
        if (Responses.blank(password) || password.length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Min length of password should be 6");
        }

        String imageUrl = null;
        String publicId = null;
        if (file != null && !file.isEmpty()) {
            String type = file.getContentType();
            if (!"image/jpeg".equals(type) && !"image/png".equals(type)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Only JPG and PNG allowed");
            }
            CloudinaryService.UploadResult up = cloudinaryService.upload(file);
            imageUrl = up.url();
            publicId = up.publicId();
        }

        try {
            User user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setPassword(encoder.encode(password));
            user.setRole(role);
            user.setProfileImageUrl(imageUrl);
            user.setIsUserActive(true);
            user.setCreatedAt(Instant.now());
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);
        } catch (RuntimeException e) {
            cloudinaryService.destroy(publicId); // don't leave an orphan image behind
            throw e;
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(Responses.of("User created successfully"));
    }

    // ---------- LOGIN ----------
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest req, HttpServletResponse response) {
        if (req == null || Responses.blank(req.email())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email");
        }
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid email"));
        if (req.password() == null || !encoder.matches(req.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid password");
        }
        if (Boolean.FALSE.equals(user.getIsUserActive())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is blocked");
        }

        String token = jwtService.generate(user);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(token, null).toString());
        return ResponseEntity.ok(Responses.of("Login success", user));
    }

    // ---------- LOGOUT ----------
    @GetMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
        return ResponseEntity.ok(Responses.of("Logout success"));
    }

    // ---------- CHECK AUTH ----------
    @GetMapping("/check-auth")
    @RequireRole({"USER", "AUTHOR", "ADMIN"})
    public ResponseEntity<Map<String, Object>> checkAuth(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser user) {
        return ResponseEntity.ok(Responses.of("authenticated", user.toPayload()));
    }

    // ---------- CHANGE PASSWORD ----------
    @PutMapping("/password")
    @RequireRole({"USER", "AUTHOR", "ADMIN"})
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestAttribute(AuthInterceptor.USER_ATTR) AuthUser authUser,
            @RequestBody PasswordRequest req) {
        if (Responses.blank(req.currentPassword()) || Responses.blank(req.newPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current and new password are required");
        }
        if (req.currentPassword().equals(req.newPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password cannot be same as current password");
        }
        if (req.newPassword().length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Min length of password should be 6");
        }
        User user = userRepository.findById(authUser.id())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (!encoder.matches(req.currentPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password incorrect");
        }
        user.setPassword(encoder.encode(req.newPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return ResponseEntity.ok(Responses.of("Password updated successfully"));
    }

    // Same cookie flags as the Node version (httpOnly, secure, sameSite=None for cross-domain)
    private ResponseCookie cookie(String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder b = ResponseCookie.from(JwtService.COOKIE_NAME, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/");
        if (maxAge != null) {
            b.maxAge(maxAge);
        }
        return b.build();
    }
}
