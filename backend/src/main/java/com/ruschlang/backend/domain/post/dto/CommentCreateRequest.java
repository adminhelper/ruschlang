package com.ruschlang.backend.domain.post.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentCreateRequest(
    @NotBlank String content,
    String author,
    String parentCommentId
) {
}
