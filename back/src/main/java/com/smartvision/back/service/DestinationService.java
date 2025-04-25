package com.smartvision.back.service;

import com.smartvision.back.entity.Destination;
import com.smartvision.back.repository.DestinationRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DestinationService {
    private final DestinationRepository destinationRepository;

    public DestinationService(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    // 목적지 이름으로 조회하는 메서드
    public Optional<Destination> getDestinationByName(String name) {
        return destinationRepository.findByName(name); // 예시: findByName 메서드를 통해 Optional<Destination> 반환
    }
}