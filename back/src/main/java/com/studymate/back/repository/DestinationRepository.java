package com.studymate.back.repository;

import com.studymate.back.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    Optional<Destination> findByName(String name);
}