package com.ruschlang.backend.infra.naver;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class NaverSearchController {

    private final NaverSearchClient naverSearchClient;

    @GetMapping("/api/search/places")
    public ResponseEntity<String> searchPlaces(@RequestParam(value = "q", defaultValue = "") String query) {
        if (query.isBlank()) {
            return ResponseEntity.ok("{\"items\":[]}");
        }

        String result = naverSearchClient.searchPlaces(query);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(result);
    }
}
