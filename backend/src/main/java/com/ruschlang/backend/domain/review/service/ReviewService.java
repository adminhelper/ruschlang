package com.ruschlang.backend.domain.review.service;

import com.ruschlang.backend.domain.restaurant.entity.Restaurant;
import com.ruschlang.backend.domain.restaurant.repository.RestaurantRepository;
import com.ruschlang.backend.domain.review.dto.ReviewCreateRequest;
import com.ruschlang.backend.domain.review.dto.ReviewResponse;
import com.ruschlang.backend.domain.review.entity.Review;
import com.ruschlang.backend.domain.review.repository.ReviewRepository;
import com.ruschlang.backend.global.common.XssUtils;
import com.ruschlang.backend.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RestaurantRepository restaurantRepository;

    public ReviewService(ReviewRepository reviewRepository, RestaurantRepository restaurantRepository) {
        this.reviewRepository = reviewRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public List<ReviewResponse> findByRestaurantId(String restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
            .map(ReviewResponse::from)
            .toList();
    }

    @Transactional
    public ReviewResponse addReview(String restaurantId, ReviewCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "해당 맛집이 없습니다."));

        String reviewerName = (request.name() == null || request.name().isBlank()) ? "익명" : request.name();
        String sanitizedReviewerName = XssUtils.sanitize(reviewerName);
        String sanitizedNote = XssUtils.sanitize(request.note());

        Review review = new Review(
            restaurant,
            sanitizedReviewerName,
            request.generation(),
            request.rating(),
            sanitizedNote,
            request.photoUrl()
        );

        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }
}
