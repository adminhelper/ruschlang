package com.ruschlang.backend.domain.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ReviewCreateRequest(
    String name,
    @NotNull BigDecimal rating,
    @NotBlank String note,
    String photoUrl
) {
}
