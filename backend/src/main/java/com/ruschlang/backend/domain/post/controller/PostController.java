package com.ruschlang.backend.domain.post.controller;

import com.ruschlang.backend.domain.post.dto.CommentCreateRequest;
import com.ruschlang.backend.domain.post.dto.CommentResponse;
import com.ruschlang.backend.domain.post.dto.PostCreateRequest;
import com.ruschlang.backend.domain.post.dto.PostResponse;
import com.ruschlang.backend.domain.post.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<PostResponse>> findAll(
        @RequestHeader(value = "x-user-role", defaultValue = "guest") String role,
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(postService.findAll(role.toLowerCase().trim(), status));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(
        @RequestHeader(value = "x-user-role", defaultValue = "guest") String role,
        @Valid @RequestBody PostCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request, role.toLowerCase().trim()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PostResponse> update(@PathVariable String id, @Valid @RequestBody PostCreateRequest request) {
        return ResponseEntity.ok(postService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<PostResponse> approve(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "");
        return ResponseEntity.ok(postService.approve(id, status));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> findComments(@PathVariable String id) {
        return ResponseEntity.ok(postService.findComments(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
        @PathVariable String id,
        @RequestHeader(value = "x-user-role", defaultValue = "guest") String role,
        @Valid @RequestBody CommentCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.addComment(id, request, role.toLowerCase().trim()));
    }
}
