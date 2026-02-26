package com.ruschlang.backend.domain.roadmap.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RoadmapRateRequest(
    @NotNull BigDecimal rating
) {
}
