package com.ruschlang.backend.domain.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Value("${admin.token:}")
    private String adminToken;

    public boolean isValidAdminToken(String token) {
        if (adminToken == null || adminToken.isBlank()) {
            return false;
        }
        return adminToken.equals(token);
    }
}
