package com.blogapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/** Open http://localhost:4000 in the browser to confirm the server is up. */
@RestController
public class HomeController {

    @GetMapping({"/", "/health"})
    public ResponseEntity<Map<String, Object>> home() {
        return ResponseEntity.ok(Responses.of("Blog API is running (Java Spring Boot + MySQL)"));
    }
}
