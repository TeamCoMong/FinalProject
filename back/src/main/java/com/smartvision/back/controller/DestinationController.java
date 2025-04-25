package com.smartvision.back.controller;

import com.smartvision.back.repository.DestinationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "http://10.0.2.2:8080/api")
@RestController
@RequestMapping("/api/destinations")
public class DestinationController {
    private final DestinationRepository destinationRepository;

    public DestinationController(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDestinations(@RequestParam String name) {
        Optional<Destination> destination = destinationRepository.findByName(name);

        if (destination.isPresent()) {
            System.out.println("🔍 검색 결과: " + destination.get());
            return ResponseEntity.ok(destination.get());
        } else {
            System.out.println("⚠️ 검색 결과 없음: " + name);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 목적지를 찾을 수 없습니다.");
        }
    }
}