package com.smartvision.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.smartvision.back.dto.PedestrianRouteRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/tmap")
public class TmapController {

    private static final Logger logger = LoggerFactory.getLogger(TmapController.class);

    private final String TMAP_API_URL = "https://apis.openapi.sk.com/tmap/routes/pedestrian";
    private final String TMAP_APP_KEY = "2AfJLYy4Roajsr0IORYof7BzkNDbphv8axCMrOFv";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/pedestrian-route")
    public ResponseEntity<?> getPedestrianRoute(@RequestBody PedestrianRouteRequest request) {
        RestTemplate restTemplate = new RestTemplate();

        String tmapRequestJson = String.format("""
            {
              "startX": "%f",
              "startY": "%f",
              "endX": "%f",
              "endY": "%f",
              "startName": "%s",
              "endName": "%s",
              "reqCoordType": "WGS84GEO",
              "resCoordType": "WGS84GEO",
              "startAngle": "0",
              "searchOption": "0",
              "trafficInfo": "Y"
            }
            """, request.getStartX(), request.getStartY(), request.getEndX(), request.getEndY(), request.getStartName(), request.getEndName());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("appKey", TMAP_APP_KEY);

        HttpEntity<String> entity = new HttpEntity<>(tmapRequestJson, headers);

        try {
            ResponseEntity<String> tmapResponse = restTemplate.exchange(
                    TMAP_API_URL,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // 원본 JSON 문자열
            String rawJson = tmapResponse.getBody();

            // JSON 문자열 파싱 후 이쁘게 포맷팅
            Object jsonObj = objectMapper.readValue(rawJson, Object.class);
            ObjectWriter writer = objectMapper.writerWithDefaultPrettyPrinter();
            String prettyJson = writer.writeValueAsString(jsonObj);

            // 로그에 개행 포함 예쁘게 출력
            logger.info("📍 TMAP 경로 응답 (포맷됨):\n{}", prettyJson);

            // 클라이언트에도 이쁘게 포맷된 JSON 전달
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(prettyJson);

        } catch (Exception e) {
            logger.error("❌ TMAP API 호출 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\":\"Tmap API 호출 실패: " + e.getMessage() + "\"}");
        }
    }
}
