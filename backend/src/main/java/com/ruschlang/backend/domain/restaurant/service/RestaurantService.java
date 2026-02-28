package com.ruschlang.backend.domain.restaurant.service;

import com.ruschlang.backend.domain.restaurant.dto.RestaurantCreateRequest;
import com.ruschlang.backend.domain.restaurant.dto.RestaurantResponse;
import com.ruschlang.backend.domain.restaurant.entity.Restaurant;
import com.ruschlang.backend.domain.restaurant.repository.RestaurantRepository;
import com.ruschlang.backend.domain.review.dto.ReviewResponse;
import com.ruschlang.backend.domain.review.entity.Review;
import com.ruschlang.backend.domain.review.repository.ReviewRepository;
import com.ruschlang.backend.global.exception.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final ReviewRepository reviewRepository;

    public RestaurantService(RestaurantRepository restaurantRepository, ReviewRepository reviewRepository) {
        this.restaurantRepository = restaurantRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<RestaurantResponse> findAll(String sort) {
        List<Restaurant> restaurants;

        if ("name".equals(sort)) {
            restaurants = restaurantRepository.findAllByOrderByNameAsc();
        } else {
            restaurants = restaurantRepository.findAllByOrderByUpdatedAtDesc();
        }

        if (restaurants.isEmpty()) {
            return List.of();
        }

        List<String> restaurantIds = restaurants.stream()
            .map(Restaurant::getId)
            .toList();

        List<Review> reviews = reviewRepository.findByRestaurantIdInOrderByCreatedAtDesc(restaurantIds);
        Map<String, List<ReviewResponse>> reviewMap = reviews.stream()
            .collect(Collectors.groupingBy(
                review -> review.getRestaurant().getId(),
                Collectors.mapping(ReviewResponse::from, Collectors.toList())
            ));

        List<RestaurantResponse> responses = restaurants.stream()
            .map(restaurant -> RestaurantResponse.from(
                restaurant,
                reviewMap.getOrDefault(restaurant.getId(), List.of())
            ))
            .toList();

        if ("rating".equals(sort)) {
            return responses.stream()
                .sorted(Comparator.comparingDouble((RestaurantResponse r) ->
                    r.reviews().stream().mapToDouble(ReviewResponse::rating).average().orElse(0.0)
                ).reversed())
                .toList();
        }

        return responses;
    }

    @Transactional
    public RestaurantResponse create(RestaurantCreateRequest request) {
        restaurantRepository.findByNameAndLatAndLng(request.name(), request.lat(), request.lng())
            .ifPresent(r -> {
                throw new BusinessException(HttpStatus.CONFLICT, "이미 등록된 맛집입니다.");
            });

        Restaurant restaurant = new Restaurant(
            request.name(),
            request.address(),
            request.lat(),
            request.lng(),
            request.description(),
            request.photoUrl()
        );

        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantResponse.from(saved);
    }

    @Transactional
    public void delete(String id) {
        Restaurant restaurant = restaurantRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "삭제할 데이터가 없습니다."));
        restaurantRepository.delete(restaurant);
    }
}
