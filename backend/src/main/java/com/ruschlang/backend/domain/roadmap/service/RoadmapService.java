package com.ruschlang.backend.domain.roadmap.service;

import com.ruschlang.backend.domain.roadmap.dto.RoadmapCreateRequest;
import com.ruschlang.backend.domain.roadmap.dto.RoadmapRateRequest;
import com.ruschlang.backend.domain.roadmap.dto.RoadmapResponse;
import com.ruschlang.backend.domain.roadmap.entity.Roadmap;
import com.ruschlang.backend.domain.roadmap.repository.RoadmapRepository;
import com.ruschlang.backend.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;

    public List<RoadmapResponse> findAll() {
        return roadmapRepository.findAllByOrderByUpdatedAtDesc().stream()
            .map(RoadmapResponse::from)
            .toList();
    }

    @Transactional
    public RoadmapResponse create(RoadmapCreateRequest request) {
        String author = (request.author() == null || request.author().isBlank()) ? "익명" : request.author();

        Roadmap roadmap = Roadmap.builder()
            .title(request.title())
            .author(author)
            .description(request.description())
            .stops(request.stops())
            .build();

        Roadmap saved = roadmapRepository.save(roadmap);
        return RoadmapResponse.from(saved);
    }

    @Transactional
    public RoadmapResponse update(String id, RoadmapCreateRequest request) {
        Roadmap roadmap = roadmapRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "수정할 로드맵이 없습니다."));

        String author = (request.author() == null || request.author().isBlank()) ? "관리자" : request.author();
        roadmap.update(request.title(), author, request.description(), request.stops());

        return RoadmapResponse.from(roadmap);
    }

    @Transactional
    public void delete(String id) {
        Roadmap roadmap = roadmapRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "삭제할 로드맵이 없습니다."));
        roadmapRepository.delete(roadmap);
    }

    @Transactional
    public RoadmapResponse rate(String id, RoadmapRateRequest request) {
        Roadmap roadmap = roadmapRepository.findById(id)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "해당 로드맵을 찾을 수 없습니다."));

        roadmap.addRating(request.rating());
        return RoadmapResponse.from(roadmap);
    }
}
