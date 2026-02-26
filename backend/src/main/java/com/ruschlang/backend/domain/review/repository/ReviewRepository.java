package com.ruschlang.backend.domain.review.repository;

import com.ruschlang.backend.domain.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, String> {
}
