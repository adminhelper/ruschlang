package com.ruschlang.backend.domain.roadmap.dto;

import com.ruschlang.backend.domain.roadmap.entity.Roadmap;

import java.time.LocalDateTime;

public record RoadmapResponse(
    String id,
    String title,
    String author,
    String description,
    String stops,
    double rating,
    int ratingCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static RoadmapResponse from(Roadmap entity) {
        return new RoadmapResponse(
            entity.getId(),
            entity.getTitle(),
            entity.getAuthor(),
            entity.getDescription(),
            entity.getStops() != null ? entity.getStops() : "",
            entity.getRating().doubleValue(),
            entity.getRatingCount(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
