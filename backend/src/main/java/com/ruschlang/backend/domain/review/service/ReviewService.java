package com.ruschlang.backend.domain.review.service;

import com.ruschlang.backend.domain.restaurant.entity.Restaurant;
import com.ruschlang.backend.domain.restaurant.repository.RestaurantRepository;
import com.ruschlang.backend.domain.review.dto.ReviewCreateRequest;
import com.ruschlang.backend.domain.review.dto.ReviewResponse;
import com.ruschlang.backend.domain.review.entity.Review;
import com.ruschlang.backend.domain.review.repository.ReviewRepository;
import com.ruschlang.backend.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional
    public ReviewResponse addReview(String restaurantId, ReviewCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "해당 맛집이 없습니다."));

        String reviewerName = (request.name() == null || request.name().isBlank()) ? "익명" : request.name();

        Review review = Review.builder()
            .restaurant(restaurant)
            .reviewerName(reviewerName)
            .rating(request.rating())
            .note(request.note())
            .photoUrl(request.photoUrl())
            .build();

        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }
}
