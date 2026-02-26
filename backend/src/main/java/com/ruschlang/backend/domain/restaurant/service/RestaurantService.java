package com.ruschlang.backend.domain.restaurant.service;

import com.ruschlang.backend.domain.restaurant.dto.RestaurantCreateRequest;
import com.ruschlang.backend.domain.restaurant.dto.RestaurantResponse;
import com.ruschlang.backend.domain.restaurant.entity.Restaurant;
import com.ruschlang.backend.domain.restaurant.repository.RestaurantRepository;
import com.ruschlang.backend.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public List<RestaurantResponse> findAll(String sort) {
        List<Restaurant> restaurants;

        if ("name".equals(sort)) {
            restaurants = restaurantRepository.findAllByOrderByNameAsc();
        } else {
            restaurants = restaurantRepository.findAllByOrderByUpdatedAtDesc();
        }

        List<RestaurantResponse> responses = restaurants.stream()
            .map(RestaurantResponse::from)
            .toList();

        if ("rating".equals(sort)) {
            return responses.stream()
                .sorted(Comparator.comparingDouble(r -> {
                    if (r.reviews().isEmpty()) return 0.0;
                    return -r.reviews().stream().mapToDouble(rev -> rev.rating()).average().orElse(0.0);
                }))
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

        Restaurant restaurant = Restaurant.builder()
            .name(request.name())
            .address(request.address())
            .lat(request.lat())
            .lng(request.lng())
            .description(request.description())
            .photoUrl(request.photoUrl())
            .build();

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
