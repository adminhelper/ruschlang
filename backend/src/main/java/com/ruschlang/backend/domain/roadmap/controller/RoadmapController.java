package com.ruschlang.backend.domain.roadmap.controller;

import com.ruschlang.backend.domain.roadmap.dto.RoadmapCreateRequest;
import com.ruschlang.backend.domain.roadmap.dto.RoadmapRateRequest;
import com.ruschlang.backend.domain.roadmap.dto.RoadmapResponse;
import com.ruschlang.backend.domain.roadmap.service.RoadmapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @GetMapping
    public ResponseEntity<List<RoadmapResponse>> findAll() {
        return ResponseEntity.ok(roadmapService.findAll());
    }

    @PostMapping
    public ResponseEntity<RoadmapResponse> create(@Valid @RequestBody RoadmapCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roadmapService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoadmapResponse> update(@PathVariable String id, @Valid @RequestBody RoadmapCreateRequest request) {
        return ResponseEntity.ok(roadmapService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        roadmapService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<RoadmapResponse> rate(@PathVariable String id, @Valid @RequestBody RoadmapRateRequest request) {
        return ResponseEntity.ok(roadmapService.rate(id, request));
    }
}
