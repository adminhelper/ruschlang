package com.ruschlang.backend.domain.roadmap.repository;

import com.ruschlang.backend.domain.roadmap.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapRepository extends JpaRepository<Roadmap, String> {

    List<Roadmap> findAllByOrderByUpdatedAtDesc();
}
