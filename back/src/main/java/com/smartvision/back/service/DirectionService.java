package com.studymate.back.service;

import com.studymate.back.dto.DirectionRequest;
import com.studymate.back.dto.DirectionResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class DirectionService {

    private static final String KAKAO_API_KEY = "1037240907e601bb2115fe00e05816fa";
    private static final String KAKAO_DIRECTION_URL = "https://apis-navi.kakaomobility.com/v1/directions";

    public DirectionResponse getWalkingDirections(DirectionRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper mapper = new ObjectMapper();

        try {
            // 1. 목적지 이름 → 좌표 변환 (Local API)
            String keyword = URLEncoder.encode(request.getDestinationName(), StandardCharsets.UTF_8);
            String localSearchUrl = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + keyword;

            HttpHeaders localHeaders = new HttpHeaders();
            localHeaders.set("Authorization", "KakaoAK " + KAKAO_API_KEY);
            HttpEntity<String> localEntity = new HttpEntity<>(localHeaders);

            String localResponse = restTemplate.exchange(localSearchUrl, HttpMethod.GET, localEntity, String.class).getBody();
            JsonNode localRoot = mapper.readTree(localResponse);
            JsonNode documents = localRoot.path("documents");

            if (!documents.isArray() || documents.size() == 0) {
                throw new RuntimeException("❌ 목적지를 찾을 수 없습니다.");
            }

            double destLat = documents.get(0).path("y").asDouble();
            double destLng = documents.get(0).path("x").asDouble();

            // 2. Kakao 도보 길찾기 API 요청
            String url = String.format(
                    "%s?origin=%f,%f&destination=%f,%f&priority=RECOMMEND",
                    KAKAO_DIRECTION_URL,
                    request.getOriginLng(), request.getOriginLat(),
                    destLng, destLat
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + KAKAO_API_KEY);
            headers.set("KA", "sdk/1.0 os/android-33 lang/ko-KR device/samsung-galaxy origin/studymate");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            String response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class).getBody();

            log.debug("📦 카카오 도보 API 응답: {}", response);

            JsonNode root = mapper.readTree(response);
            JsonNode routes = root.path("routes");

            if (!routes.isArray() || routes.size() == 0) {
                throw new RuntimeException("❌ 도보 경로가 존재하지 않습니다.");
            }

            JsonNode firstRoute = routes.get(0);
            JsonNode sections = firstRoute.path("sections");

            if (!sections.isArray() || sections.size() == 0) {
                throw new RuntimeException("❌ 섹션 정보가 없습니다.");
            }

            JsonNode roads = sections.get(0).path("roads");
            if (!roads.isArray()) {
                throw new RuntimeException("❌ 도로 정보가 없습니다.");
            }

            JsonNode summary = firstRoute.path("summary");
            List<List<Double>> path = new ArrayList<>();

            for (JsonNode road : roads) {
                JsonNode vertexes = road.path("vertexes");
                if (vertexes.isArray()) {
                    for (int i = 0; i + 1 < vertexes.size(); i += 2) {
                        double lng = vertexes.get(i).asDouble();
                        double lat = vertexes.get(i + 1).asDouble();
                        path.add(List.of(lat, lng));
                    }
                }
            }

            DirectionResponse result = new DirectionResponse();
            result.setPath(path);
            result.setDistance(Math.round(summary.path("distance").asDouble()) / 1000.0); // m → km
            result.setDuration((int) Math.round(summary.path("duration").asDouble() / 60.0)); // 초 → 분

            return result;

        } catch (Exception e) {
            log.error("🚨 길찾기 오류", e);
            throw new RuntimeException("길찾기 실패: " + e.getMessage());
        }
    }
}