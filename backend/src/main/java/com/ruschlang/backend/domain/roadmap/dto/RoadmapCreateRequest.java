package com.ruschlang.backend.domain.roadmap.dto;

import jakarta.validation.constraints.NotBlank;

public record RoadmapCreateRequest(
    @NotBlank String title,
    String author,
    @NotBlank String description,
    String stops
) {
}
