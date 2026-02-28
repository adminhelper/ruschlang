package com.ruschlang.backend.domain.review.controller;

import com.ruschlang.backend.domain.review.dto.ReviewCreateRequest;
import com.ruschlang.backend.domain.review.dto.ReviewResponse;
import com.ruschlang.backend.domain.review.service.ReviewService;
import com.ruschlang.backend.global.common.MemberRequired;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> findByRestaurantId(@PathVariable String restaurantId) {
        return ResponseEntity.ok(reviewService.findByRestaurantId(restaurantId));
    }

    @PostMapping
    @MemberRequired
    public ResponseEntity<ReviewResponse> addReview(
        @PathVariable String restaurantId,
        @Valid @RequestBody ReviewCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.addReview(restaurantId, request));
    }
}
