package com.ruschlang.backend.domain.review.controller;

import com.ruschlang.backend.domain.review.dto.ReviewCreateRequest;
import com.ruschlang.backend.domain.review.dto.ReviewResponse;
import com.ruschlang.backend.domain.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
        @PathVariable String restaurantId,
        @Valid @RequestBody ReviewCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.addReview(restaurantId, request));
    }
}
