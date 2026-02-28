package com.ruschlang.backend.domain.review.repository;

import com.ruschlang.backend.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {

    List<Review> findByRestaurantIdOrderByCreatedAtDesc(String restaurantId);

    List<Review> findByRestaurantIdInOrderByCreatedAtDesc(List<String> restaurantIds);
}
