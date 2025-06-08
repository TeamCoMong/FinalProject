package com.smartvision.back.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    @PostMapping("/bill")
    public ResponseEntity<Map<String, Object>> recognizeBill(@RequestBody Map<String, String> request) {
        String base64Image = request.get("imageBase64");

        // TODO: 실제 OCR 처리 로직 필요 (현재는 하드코딩)
        String detectedAmount = "10000";

        Map<String, Object> response = new HashMap<>();
        response.put("amount", detectedAmount);

        return ResponseEntity.ok(response);
    }
}
