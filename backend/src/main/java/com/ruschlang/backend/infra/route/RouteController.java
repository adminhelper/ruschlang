package com.ruschlang.backend.infra.route;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class RouteController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/api/routes/directions")
    public ResponseEntity<String> getDirections(
        @RequestParam(defaultValue = "foot") String mode,
        @RequestParam String coords
    ) {
        String profile = "car".equals(mode) ? "car" : "foot";
        String url = String.format(
            "https://router.project-osrm.org/route/v1/%s/%s?overview=full&geometries=geojson&steps=false",
            profile, coords
        );

        String result = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(result);
    }
}
