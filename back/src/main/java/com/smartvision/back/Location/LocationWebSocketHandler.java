
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
            System.out.println("websocket 보호자 연결됨: " + session.getId());
            System.out.println("현재 guardianSessions 수: " + guardianSessions.size());
        } else if (uri.contains("/user")) {
            userSessions.add(session);
            System.out.println("websocket 사용자 연결됨: " + session.getId());
            System.out.println("현재 userSessions 수: " + userSessions.size());
        } else {
            System.out.println("알 수 없는 URI 연결됨: " + uri + " → sessionId: " + session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();

        try {
            JsonElement jsonElement = JsonParser.parseString(payload);
            JsonObject jsonMessage = jsonElement.getAsJsonObject();

            double lat = jsonMessage.has("lat") ? jsonMessage.get("lat").getAsDouble() :
                    jsonMessage.has("latitude") ? jsonMessage.get("latitude").getAsDouble() : 0.0;

            double lon = jsonMessage.has("lon") ? jsonMessage.get("lon").getAsDouble() :
                    jsonMessage.has("longitude") ? jsonMessage.get("longitude").getAsDouble() : 0.0;

            System.out.println("위치 수신 lat=" + lat + ", lon=" + lon);

            JsonObject locationJson = new JsonObject();
            locationJson.addProperty("lat", lat);
            locationJson.addProperty("lon", lon);

            String locationMessage = locationJson.toString();

            System.out.println("userSessions 전체 전송 대상 수: " + userSessions.size());

            for (WebSocketSession user : userSessions) {
                System.out.println("user 에게 전송 시도: " + user.getId() + " → isOpen=" + user.isOpen());
                if (user.isOpen()) {
                    user.sendMessage(new TextMessage(locationMessage));
                    System.out.println("user 에게 전송됨: " + user.getId());
                } else {
                    System.out.println("user 세션 닫힘 상태: " + user.getId());
                }
            }

            for (WebSocketSession guardian : guardianSessions) {
                System.out.println("guardian 에게 전송 시도: " + guardian.getId() + " → isOpen=" + guardian.isOpen());
                if (guardian.isOpen()) {
                    guardian.sendMessage(new TextMessage(locationMessage));
                    System.out.println("guardian 에게 전송됨: " + guardian.getId());
                } else {
                    System.out.println("guardian 세션 닫힘 상태: " + guardian.getId());
                }
            }

        } catch (Exception e) {
            System.err.println("위치 정보 처리 에러: " + e.getMessage());
        }
    }


    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        guardianSessions.remove(session);
        userSessions.remove(session);

        System.out.println("세션 종료됨: " + session.getId() + " → CloseStatus: " + status);
        System.out.println("현재 userSessions 수: " + userSessions.size());
        System.out.println("현재 guardianSessions 수: " + guardianSessions.size());
    }
}
