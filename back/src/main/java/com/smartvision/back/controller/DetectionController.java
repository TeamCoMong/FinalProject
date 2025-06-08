package com.smartvision.back.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class DetectionController {

    @GetMapping("/detect/start")
    public ResponseEntity<String> startDetection() {
        RestTemplate rt = new RestTemplate();
        String url = "http://localhost:8000/start-detection";  // FastAPI 서버 주소
        String response = rt.getForObject(url, String.class);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detect/stop")
    public ResponseEntity<String> stopDetection() {
        RestTemplate rt = new RestTemplate();
        String url = "http://localhost:8000/stop-detection";  // FastAPI 서버 주소
        String response = rt.getForObject(url, String.class);
        return ResponseEntity.ok(response);
    }
}
