package com.ruschlang.backend.domain.review.dto;

import com.ruschlang.backend.domain.review.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
    String id,
    String name,
    double rating,
    String note,
    String photoUrl,
    LocalDateTime createdAt
) {
    public static ReviewResponse from(Review entity) {
        return new ReviewResponse(
            entity.getId(),
            entity.getReviewerName(),
            entity.getRating().doubleValue(),
            entity.getNote(),
            entity.getPhotoUrl() != null ? entity.getPhotoUrl() : "",
            entity.getCreatedAt()
        );
    }
}
