package com.ruschlang.backend.domain.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Value("${admin.token}")
    private String adminToken;

    public boolean isValidAdminToken(String token) {
        if (adminToken == null || adminToken.isBlank() || token == null || token.isBlank()) {
            return false;
        }
        byte[] expected = adminToken.getBytes(StandardCharsets.UTF_8);
        byte[] actual = token.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }
}
