package com.ruschlang.backend.domain.post.repository;

import com.ruschlang.backend.domain.post.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, String> {

    List<PostComment> findAllByPostIdOrderByCreatedAtAsc(String postId);

    List<PostComment> findAllByPostIdInOrderByCreatedAtAsc(List<String> postIds);
}
