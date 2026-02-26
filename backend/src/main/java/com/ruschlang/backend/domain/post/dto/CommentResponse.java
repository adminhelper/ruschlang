package com.ruschlang.backend.domain.post.dto;

import com.ruschlang.backend.domain.post.entity.PostComment;

import java.time.LocalDateTime;

public record CommentResponse(
    String id,
    String postId,
    String parentCommentId,
    String author,
    String content,
    LocalDateTime createdAt
) {
    public static CommentResponse from(PostComment entity) {
        return new CommentResponse(
            entity.getId(),
            entity.getPost().getId(),
            entity.getParentCommentId() != null ? entity.getParentCommentId() : "",
            entity.getAuthor(),
            entity.getContent(),
            entity.getCreatedAt()
        );
    }
}
