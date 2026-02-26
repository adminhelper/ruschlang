package com.ruschlang.backend.domain.post.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record PostCreateRequest(
    @NotBlank String title,
    String author,
    @NotBlank String content,
    BigDecimal lat,
    BigDecimal lng,
    String address,
    String placeName,
    BigDecimal rating
) {
}
