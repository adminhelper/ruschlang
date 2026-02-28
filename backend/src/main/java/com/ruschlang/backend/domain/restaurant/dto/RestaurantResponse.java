package com.ruschlang.backend.domain.restaurant.dto;

import com.ruschlang.backend.domain.restaurant.entity.Restaurant;
import com.ruschlang.backend.domain.review.dto.ReviewResponse;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

public record RestaurantResponse(
    String id,
    String name,
    String address,
    double lat,
    double lng,
    String description,
    String photoUrl,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<ReviewResponse> reviews
) {
    public static RestaurantResponse from(Restaurant entity) {
        return from(entity, Collections.emptyList());
    }

    public static RestaurantResponse from(Restaurant entity, List<ReviewResponse> reviews) {
        return new RestaurantResponse(
            entity.getId(),
            entity.getName(),
            entity.getAddress(),
            entity.getLat().doubleValue(),
            entity.getLng().doubleValue(),
            entity.getDescription(),
            entity.getPhotoUrl() != null ? entity.getPhotoUrl() : "",
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            reviews
        );
    }
}
