package com.blogapp.controller;

import java.util.LinkedHashMap;
import java.util.Map;

/** Builds the {"message": ..., "payload": ...} JSON shape used by every endpoint. */
final class Responses {
    private Responses() {}

    static Map<String, Object> of(String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("message", message);
        return m;
    }

    static Map<String, Object> of(String message, Object payload) {
        Map<String, Object> m = of(message);
        m.put("payload", payload);
        return m;
    }

    static boolean blank(String s) {
        return s == null || s.isBlank();
    }
}
