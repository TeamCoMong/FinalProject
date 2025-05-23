package com.smartvision.back.service;

import com.smartvision.back.dto.PedestrianRouteRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TmapService {

    private final RestTemplate restTemplate;
    private final String TMAP_API_URL = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json";
    private final String TMAP_APP_KEY = "2AfJLYy4Roajsr0IORYof7BzkNDbphv8axCMrOFv";

    @Autowired
    public TmapService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getPedestrianRoute(PedestrianRouteRequest request) {
        String tmapRequestJson = String.format("""
            {
              "startX": "%.7f",
              "startY": "%.7f",
              "endX": "%.7f",
              "endY": "%.7f",
              "startName": "%s",
              "endName": "%s",
              "reqCoordType": "WGS84GEO",
              "resCoordType": "WGS84GEO",
              "startAngle": "0",
              "searchOption": "0",
              "trafficInfo": "Y"
            }
            """,
                request.getStartX(), request.getStartY(),
                request.getEndX(), request.getEndY(),
                request.getStartName(), request.getEndName()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("appKey", TMAP_APP_KEY);

        HttpEntity<String> entity = new HttpEntity<>(tmapRequestJson, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                TMAP_API_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        return response.getBody(); // JSON string
    }
}
