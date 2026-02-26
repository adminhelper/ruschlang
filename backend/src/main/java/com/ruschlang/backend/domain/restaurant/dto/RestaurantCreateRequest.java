package com.ruschlang.backend.domain.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record RestaurantCreateRequest(
    @NotBlank String name,
    @NotBlank String address,
    @NotNull BigDecimal lat,
    @NotNull BigDecimal lng,
    @NotBlank String description,
    String photoUrl
) {
}
