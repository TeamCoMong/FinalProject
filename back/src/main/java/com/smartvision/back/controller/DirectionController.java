package com.studymate.back.controller;

import com.studymate.back.dto.DirectionRequest;
import com.studymate.back.dto.DirectionResponse;
import com.studymate.back.service.DirectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/directions")
public class DirectionController {

    private final DirectionService directionService;

    public DirectionController(DirectionService directionService) {
        this.directionService = directionService;
    }

    @GetMapping
    public ResponseEntity<DirectionResponse> getDirection(
            @RequestParam double startLat,
            @RequestParam double startLng,
            @RequestParam String destinationName) {

        DirectionRequest req = new DirectionRequest(startLat, startLng, destinationName);
        DirectionResponse res = directionService.getWalkingDirections(req);
        return ResponseEntity.ok(res);
    }

}
