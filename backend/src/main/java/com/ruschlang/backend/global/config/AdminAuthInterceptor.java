package com.ruschlang.backend.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruschlang.backend.domain.auth.service.AuthService;
import com.ruschlang.backend.global.common.AdminOnly;
import com.ruschlang.backend.global.common.MemberRequired;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Map;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;
    private final ObjectMapper objectMapper;

    public AdminAuthInterceptor(AuthService authService, ObjectMapper objectMapper) {
        this.authService = authService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        AdminOnly adminOnly = handlerMethod.getMethodAnnotation(AdminOnly.class);
        if (adminOnly != null) {
            String token = request.getHeader("x-admin-token");
            if (!authService.isValidAdminToken(token)) {
                writeJson(response, HttpStatus.UNAUTHORIZED, Map.of(
                    "error", "Unauthorized",
                    "message", "관리자 토큰이 필요합니다"
                ));
                return false;
            }
        }

        MemberRequired memberRequired = handlerMethod.getMethodAnnotation(MemberRequired.class);
        if (memberRequired != null) {
            String headerRole = request.getHeader("x-user-role");
            String role = headerRole == null ? "" : headerRole.trim().toLowerCase();
            if (!"member".equals(role) && !"admin".equals(role)) {
                writeJson(response, HttpStatus.FORBIDDEN, Map.of(
                    "error", "Forbidden",
                    "message", "회원 이상 권한이 필요합니다"
                ));
                return false;
            }
        }

        return true;
    }

    private void writeJson(HttpServletResponse response, HttpStatus status, Map<String, String> body) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
