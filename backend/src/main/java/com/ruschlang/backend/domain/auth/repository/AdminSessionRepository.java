package com.ruschlang.backend.domain.auth.repository;

import com.ruschlang.backend.domain.auth.entity.AdminSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSessionRepository extends JpaRepository<AdminSession, Long> {
}
