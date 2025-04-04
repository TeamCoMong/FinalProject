package com.studymate.back.controller;

import com.studymate.back.entity.Destination;
import com.studymate.back.repository.DestinationRepository;
import com.studymate.back.service.DestinationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


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