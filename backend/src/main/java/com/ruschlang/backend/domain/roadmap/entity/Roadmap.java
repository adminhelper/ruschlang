package com.ruschlang.backend.domain.roadmap.entity;

import com.ruschlang.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "roadmaps")
public class Roadmap extends BaseTimeEntity {

    @Id
    @Column(columnDefinition = "char(36)")
    private String id;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(nullable = false, length = 60)
    private String author;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(length = 1200)
    private String stops;

    @Column(nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.rating == null) {
            this.rating = BigDecimal.ZERO;
        }
        if (this.ratingCount == null) {
            this.ratingCount = 0;
        }
    }

    @Builder
    public Roadmap(String title, String author, String description, String stops) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.stops = stops;
        this.rating = BigDecimal.ZERO;
        this.ratingCount = 0;
    }

    public void update(String title, String author, String description, String stops) {
        this.title = title;
        this.author = author;
        this.description = description;
        this.stops = stops;
    }

    public void addRating(BigDecimal newRating) {
        BigDecimal total = this.rating.multiply(BigDecimal.valueOf(this.ratingCount)).add(newRating);
        this.ratingCount = this.ratingCount + 1;
        this.rating = total.divide(BigDecimal.valueOf(this.ratingCount), 1, RoundingMode.HALF_UP);
    }
}
