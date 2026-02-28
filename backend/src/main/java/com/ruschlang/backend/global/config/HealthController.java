package com.ruschlang.backend.global.config;

import com.ruschlang.backend.domain.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final AuthService authService;

    @Value("${naver.map.client-id:}")
    private String naverMapClientId;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(2);
            if (!valid) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("ok", false, "error", "DB connection failed"));
            }

            return ResponseEntity.ok(Map.of("ok", true, "timestamp", Instant.now().toString()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("ok", false, "error", "DB connection failed"));
        }
    }

    @GetMapping("/admin/ping")
    public ResponseEntity<Map<String, Object>> adminPing(@RequestHeader(value = "x-admin-token", required = false) String token) {
        if (!authService.isValidAdminToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("ok", false));
        }
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/map/config")
    public ResponseEntity<Map<String, Object>> mapConfig() {
        boolean configured = naverMapClientId != null && !naverMapClientId.isBlank();
        return ResponseEntity.ok(
            Map.of(
                "ok", true,
                "provider", "naver",
                "configured", configured,
                "clientId", configured ? naverMapClientId : ""
            )
        );
    }
}
