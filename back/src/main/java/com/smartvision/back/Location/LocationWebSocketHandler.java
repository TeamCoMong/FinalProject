
package com.smartvision.back.Location;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;


import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonElement;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class LocationWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> guardianSessions = ConcurrentHashMap.newKeySet();
    private final Set<WebSocketSession> userSessions = ConcurrentHashMap.newKeySet();


    // 사용자 및 보호자 위치 정보
    private double userLat;
    private double userLon;
    private double guardianLat;
    private double guardianLon;

    // 위치 정보 업데이트 메서드
    public void updateUserLocation(double lat, double lon) {
        this.userLat = lat;
        this.userLon = lon;
    }

    public void updateGuardianLocation(double lat, double lon) {
        this.guardianLat = lat;
        this.guardianLon = lon;
    }




    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String uri = session.getUri().toString();
        if (uri.contains("/guardian")) {
            guardianSessions.add(session);
            System.out.println("👁️ 보호자 연결됨: " + session.getId());
        } else if (uri.contains("/user")) {
            userSessions.add(session);
            System.out.println("🧑 사용자 연결됨: " + session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();

        try {
            // JSON 문자열을 JsonElement로 파싱
            JsonElement jsonElement = JsonParser.parseString(payload);

            // JsonObject로 변환
            JsonObject jsonMessage = jsonElement.getAsJsonObject();

            // "role" 필드가 없거나 null인 경우 기본값을 설정
            String role = jsonMessage.has("role") && !jsonMessage.get("role").isJsonNull() ?
                    jsonMessage.get("role").getAsString() : "unknown";

            // 위치 정보 추출, 값이 없으면 기본값 0.0을 사용
            double lat = jsonMessage.has("lat") ? jsonMessage.get("lat").getAsDouble() : 0.0;
            double lon = jsonMessage.has("lon") ? jsonMessage.get("lon").getAsDouble() : 0.0;

            // 역할에 따라 사용자 또는 보호자 위치 업데이트
            if ("user".equals(role)) {
                updateUserLocation(lat, lon);
            } else if ("guardian".equals(role)) {
                updateGuardianLocation(lat, lon);
            } else {
                System.out.println("알 수 없는 역할: " + role);
            }
        } catch (Exception e) {
            System.err.println("위치 정보 처리 에러: " + e.getMessage());
        }

        // 사용자의 위치를 보호자에게 전달
        if (userSessions.contains(session)) {
            for (WebSocketSession guardian : guardianSessions) {
                if (guardian.isOpen()) {
                    String locationMessage = String.format("{\"lat\": %f, \"lon\": %f, \"role\": \"user\"}",
                            userLat, userLon);
                    guardian.sendMessage(new TextMessage(locationMessage));
                }
            }
        }

        // 보호자의 위치를 사용자에게 전달
        if (guardianSessions.contains(session)) {
            for (WebSocketSession user : userSessions) {
                if (user.isOpen()) {
                    String locationMessage = String.format("{\"lat\": %f, \"lon\": %f, \"role\": \"guardian\"}",
                            guardianLat, guardianLon);
                    user.sendMessage(new TextMessage(locationMessage));
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        guardianSessions.remove(session);
        userSessions.remove(session);
    }
}
