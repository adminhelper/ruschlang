package com.ruschlang.backend.domain.restaurant.repository;

import com.ruschlang.backend.domain.restaurant.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface RestaurantRepository extends JpaRepository<Restaurant, String> {

    List<Restaurant> findAllByOrderByUpdatedAtDesc();

    List<Restaurant> findAllByOrderByNameAsc();

    Optional<Restaurant> findByNameAndLatAndLng(String name, BigDecimal lat, BigDecimal lng);
}
