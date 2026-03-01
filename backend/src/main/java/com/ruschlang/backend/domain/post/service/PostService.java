package com.ruschlang.backend.domain.post.service;

import com.ruschlang.backend.domain.post.dto.*;
import com.ruschlang.backend.domain.post.entity.Post;
import com.ruschlang.backend.domain.post.entity.PostComment;
import com.ruschlang.backend.domain.post.repository.PostCommentRepository;
import com.ruschlang.backend.domain.post.repository.PostRepository;
import com.ruschlang.backend.global.common.XssUtils;
import com.ruschlang.backend.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;

    public List<PostResponse> findAll(String role, String statusFilter) {
        List<Post> posts;

        if (statusFilter != null && !statusFilter.isBlank()) {
            posts = postRepository.findAllByStatusInOrderByCreatedAtDesc(List.of(statusFilter));
        } else if ("admin".equals(role)) {
            posts = postRepository.findAllByOrderByCreatedAtDesc();
        } else if ("member".equals(role)) {
            posts = postRepository.findAllByStatusInOrderByCreatedAtDesc(List.of("approved", "pending"));
        } else {
            posts = postRepository.findAllByStatusInOrderByCreatedAtDesc(List.of("approved"));
        }

        if (posts.isEmpty()) {
            return List.of();
        }

        List<String> postIds = posts.stream().map(Post::getId).toList();
        List<PostComment> allComments = postCommentRepository.findAllByPostIdInOrderByCreatedAtAsc(postIds);

        Map<String, List<CommentResponse>> commentMap = allComments.stream()
            .map(CommentResponse::from)
            .collect(Collectors.groupingBy(CommentResponse::postId));

        return posts.stream()
            .map(post -> PostResponse.from(post, commentMap.getOrDefault(post.getId(), List.of())))
            .toList();
    }

    @Transactional
    public PostResponse create(PostCreateRequest request, String role) {
        String author = (request.author() == null || request.author().isBlank())
            ? ("admin".equals(role) ? "관리자" : "익명")
            : request.author();
        String sanitizedTitle = XssUtils.sanitize(request.title());
        String sanitizedAuthor = XssUtils.sanitize(author);
        String sanitizedContent = XssUtils.sanitize(request.content());
        String status = "admin".equals(role) ? "approved" : "pending";

        Post post = Post.builder()
            .title(sanitizedTitle)
            .author(sanitizedAuthor)
            .authorRole(role)
            .content(sanitizedContent)
            .lat(request.lat())
            .lng(request.lng())
            .address(request.address())
            .placeName(request.placeName())
            .rating(request.rating())
            .status(status)
            .build();

        Post saved = postRepository.save(post);
        return PostResponse.from(saved, List.of());
    }

    @Transactional
    public PostResponse update(String id, PostCreateRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "수정할 게시글이 없습니다."));

        post.update(request.title(), request.content());

        List<CommentResponse> comments = postCommentRepository.findAllByPostIdOrderByCreatedAtAsc(id).stream()
            .map(CommentResponse::from)
            .toList();

        return PostResponse.from(post, comments);
    }

    @Transactional
    public PostResponse approve(String id, String status) {
        if (!"approved".equals(status) && !"rejected".equals(status)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "상태값은 approved 또는 rejected만 가능합니다");
        }

        Post post = postRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "대상 게시글이 없습니다."));

        post.updateStatus(status);
        return PostResponse.from(post, List.of());
    }

    @Transactional
    public void delete(String id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "삭제할 게시글이 없습니다."));
        postRepository.delete(post);
    }

    public List<CommentResponse> findComments(String postId) {
        postRepository.findById(postId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "해당 게시글이 없습니다."));

        return postCommentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
            .map(CommentResponse::from)
            .toList();
    }

    @Transactional
    public CommentResponse addComment(String postId, CommentCreateRequest request, String role) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "해당 게시글이 없습니다."));

        if (!"admin".equals(role) && !"approved".equals(post.getStatus())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "승인된 게시글에만 댓글을 달 수 있습니다.");
        }

        String author = (request.author() == null || request.author().isBlank())
            ? ("admin".equals(role) ? "관리자" : "익명")
            : request.author();
        String sanitizedAuthor = XssUtils.sanitize(author);
        String sanitizedContent = XssUtils.sanitize(request.content());

        PostComment comment = PostComment.builder()
            .post(post)
            .parentCommentId(request.parentCommentId())
            .author(sanitizedAuthor)
            .content(sanitizedContent)
            .build();

        PostComment saved = postCommentRepository.save(comment);
        return CommentResponse.from(saved);
    }
}
