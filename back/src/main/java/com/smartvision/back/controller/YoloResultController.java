// YoloResultController.java
package com.smartvision.back.controller;

import com.smartvision.back.dto.YoloResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.smartvision.back.dto.DistanceDto;

@RestController
@RequestMapping("/api/yolo-results")
@Slf4j
public class YoloResultController {

    @PostMapping
    public ResponseEntity<String> receiveYoloResults(@RequestBody YoloResultDto dto) {
        log.info("📥 YOLO 분석 결과 수신: deviceId={}, timestamp={}", dto.getDeviceId(), dto.getTimestamp());
        dto.getDetections().forEach(d ->
                log.info(" - 감지된 객체: {} ({}%)", d.getLabel(), d.getConfidence() * 100)
        );

        // TODO: DB 저장, 알림 발송 등 필요 시 추가

        return ResponseEntity.ok("YOLO 결과 수신 완료");
    }

    @PostMapping("/distance")
    public ResponseEntity<String> receiveDistance(@RequestBody DistanceDto dto) {
        log.info("📡 거리 데이터 수신: distance={}cm, strength={}, temp={}°C",
                dto.getDistance(), dto.getStrength(), dto.getTemp());

        // TODO: DB 저장이나 알림 등 필요한 작업 여기에 추가

        return ResponseEntity.ok("거리 데이터 수신 완료");
    }
}
