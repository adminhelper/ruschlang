package com.ruschlang.backend.domain.post.repository;

import com.ruschlang.backend.domain.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findAllByStatusInOrderByCreatedAtDesc(List<String> statuses);
}
