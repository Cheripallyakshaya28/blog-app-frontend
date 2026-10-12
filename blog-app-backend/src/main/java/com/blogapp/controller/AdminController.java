package com.blogapp.controller;

import com.blogapp.exception.ApiException;
import com.blogapp.model.User;
import com.blogapp.repository.ArticleRepository;
import com.blogapp.repository.UserRepository;
import com.blogapp.security.RequireRole;
import com.blogapp.service.ArticleViewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Admin only  (was AdminAPI.js, mounted at /admin-api) */
@RestController
@RequestMapping("/admin-api")
public class AdminController {

    public record StatusRequest(String status) {}

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final ArticleViewService views;

    public AdminController(UserRepository userRepository, ArticleRepository articleRepository,
                           ArticleViewService views) {
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
        this.views = views;
    }

    // read all users & authors (password is never serialized)
    @GetMapping("/users")
    @RequireRole("ADMIN")
    public ResponseEntity<Map<String, Object>> users() {
        return ResponseEntity.ok(Responses.of("users", userRepository.findByRoleIn(List.of("USER", "AUTHOR"))));
    }

    @GetMapping("/authors")
    @RequireRole("ADMIN")
    public ResponseEntity<Map<String, Object>> authors() {
        return ResponseEntity.ok(Responses.of("authors", userRepository.findByRole("AUTHOR")));
    }

    @GetMapping("/articles")
    @RequireRole("ADMIN")
    public ResponseEntity<Map<String, Object>> articles() {
        return ResponseEntity.ok(Responses.of("articles", views.toViews(articleRepository.findAllOrdered())));
    }

    @DeleteMapping("/articles/{id}")
    @RequireRole("ADMIN")
    public ResponseEntity<Map<String, Object>> deleteArticle(@PathVariable("id") Long id) {
        if (!articleRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Article not found");
        }
        articleRepository.deleteById(id);
        return ResponseEntity.ok(Responses.of("Article deleted"));
    }

    @DeleteMapping("/users/{id}")
    @RequireRole("ADMIN")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable("id") Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if ("ADMIN".equals(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts cannot be deleted");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Responses.of("User deleted"));
    }

    // BLOCK / ACTIVATE USER
    @PutMapping("/user/{userId}/status")
    @RequireRole("ADMIN")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable("userId") Long userId,
                                                            @RequestBody StatusRequest req) {
        if (!"ACTIVE".equals(req.status()) && !"BLOCKED".equals(req.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if ("ADMIN".equals(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts cannot be blocked");
        }
        user.setIsUserActive("ACTIVE".equals(req.status()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        return ResponseEntity.ok(Responses.of("Status updated", user));
    }
}
