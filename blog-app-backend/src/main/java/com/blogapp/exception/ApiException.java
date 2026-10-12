package com.blogapp.exception;

import org.springframework.http.HttpStatus;

/** Thrown anywhere in the app to return {"message": ...} with a given HTTP status. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String error;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.error = null;
    }

    private ApiException(HttpStatus status, String message, String error) {
        super(message);
        this.status = status;
        this.error = error;
    }

    /** Validation error response: {"message":"error occurred","error":"..."} */
    public static ApiException validation(String error) {
        return new ApiException(HttpStatus.BAD_REQUEST, "error occurred", error);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }
}
