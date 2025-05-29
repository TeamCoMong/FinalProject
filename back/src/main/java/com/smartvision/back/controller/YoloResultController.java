// YoloResultController.java
package com.smartvision.back.controller;

import com.smartvision.back.dto.YoloResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
