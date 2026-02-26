package com.ruschlang.backend.domain.post.entity;

import com.ruschlang.backend.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "posts")
public class Post extends BaseTimeEntity {

    @Id
    @Column(columnDefinition = "char(36)")
    private String id;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 80)
    private String author;

    @Column(name = "author_role", nullable = false, columnDefinition = "enum('guest','member','admin')")
    private String authorRole;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(precision = 10, scale = 6)
    private BigDecimal lat;

    @Column(precision = 10, scale = 6)
    private BigDecimal lng;

    @Column(length = 255)
    private String address;

    @Column(name = "place_name", length = 255)
    private String placeName;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(nullable = false, columnDefinition = "enum('pending','approved','rejected')")
    private String status;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostComment> comments = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.status == null) {
            this.status = "pending";
        }
        if (this.authorRole == null) {
            this.authorRole = "member";
        }
    }

    @Builder
    public Post(String title, String author, String authorRole, String content,
                BigDecimal lat, BigDecimal lng, String address, String placeName,
                BigDecimal rating, String status) {
        this.title = title;
        this.author = author;
        this.authorRole = authorRole;
        this.content = content;
        this.lat = lat;
        this.lng = lng;
        this.address = address;
        this.placeName = placeName;
        this.rating = rating;
        this.status = status;
    }

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public void updateStatus(String status) {
        this.status = status;
    }
}
