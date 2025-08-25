package com.example.gateway.filter;

public class AuthValidationResponse {

    private boolean valid;
    private String id;

    // Constructor
    public AuthValidationResponse(boolean valid, String id) {
        this.valid = valid;
        this.id = id;
    }

    // Getters and Setters
    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
