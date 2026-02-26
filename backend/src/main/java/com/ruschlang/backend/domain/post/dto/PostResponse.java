package com.ruschlang.backend.domain.post.dto;

import com.ruschlang.backend.domain.post.entity.Post;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
    String id,
    String title,
    String author,
    String authorRole,
    String content,
    BigDecimal lat,
    BigDecimal lng,
    String address,
    String placeName,
    BigDecimal rating,
    String status,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<CommentResponse> comments
) {
    public static PostResponse from(Post entity, List<CommentResponse> comments) {
        return new PostResponse(
            entity.getId(),
            entity.getTitle(),
            entity.getAuthor(),
            entity.getAuthorRole(),
            entity.getContent(),
            entity.getLat(),
            entity.getLng(),
            entity.getAddress() != null ? entity.getAddress() : "",
            entity.getPlaceName() != null ? entity.getPlaceName() : "",
            entity.getRating(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            comments
        );
    }
}
