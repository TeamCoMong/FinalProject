package com.smartvision.back.controller;

import com.smartvision.back.dto.RouteDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/route")
public class RouteController {

    private final Map<String, RouteDTO> routeStore = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<?> saveRoute(@RequestBody RouteDTO route) {
        routeStore.put(route.getUserId(), route);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getRoute(@PathVariable String userId) {
        RouteDTO route = routeStore.get(userId);
        if (route == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("경로 없음");
        }
        return ResponseEntity.ok(route);
    }
}