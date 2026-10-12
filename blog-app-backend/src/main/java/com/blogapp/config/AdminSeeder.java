package com.blogapp.config;

import com.blogapp.model.User;
import com.blogapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

/**
 * The app has no "register admin" screen, so create the first ADMIN from env vars
 * (ADMIN_EMAIL / ADMIN_PASSWORD) if it doesn't exist yet. Does nothing when they are empty.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;
    private final String email;
    private final String password;
    private final String firstName;

    public AdminSeeder(UserRepository userRepository,
                       BCryptPasswordEncoder encoder,
                       @Value("${app.admin.email:}") String email,
                       @Value("${app.admin.password:}") String password,
                       @Value("${app.admin.first-name:Admin}") String firstName) {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
    }

    @Override
    public void run(String... args) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            return;
        }
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User admin = new User();
        admin.setFirstName(firstName);
        admin.setLastName("");
        admin.setEmail(email);
        admin.setPassword(encoder.encode(password));
        admin.setRole("ADMIN");
        admin.setIsUserActive(true);
        admin.setCreatedAt(Instant.now());
        admin.setUpdatedAt(Instant.now());
        userRepository.save(admin);
        log.info("Admin user created: {}", email);
    }
}
