package com.smartvision.back.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.smartvision.back.dto.DialogflowResult;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

import com.smartvision.back.service.DialogflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dialogflow")
public class DialogflowController {

    private final DialogflowService dialogflowService;

    public DialogflowController(DialogflowService dialogflowService) {
        this.dialogflowService = dialogflowService;
    }

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    // ✅ SSE 연결: 앱이 이 엔드포인트에 연결하면 이벤트 기다림
    @GetMapping(value = "/sse", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sseConnection() {
        SseEmitter emitter = new SseEmitter(0L); // 연결 무제한 유지
        emitters.add(emitter);

        emitter.onCompletion(() -> {
            emitters.remove(emitter);
            System.out.println("🔌 SSE 완료 → 제거됨 | 현재 연결 수: " + emitters.size());
        });

        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            System.out.println("⏰ SSE 타임아웃 → 제거됨 | 현재 연결 수: " + emitters.size());
        });

        emitter.onError((e) -> {
            emitters.remove(emitter);
            System.out.println("💥 SSE 에러 → 제거됨 | 현재 연결 수: " + emitters.size());
        });

        System.out.println("📡 SSE 연결됨! 현재 연결 수: " + emitters.size());

        return emitter;
    }

    // ✅ Dialogflow intent 요청 + SSE 푸시
    @GetMapping("/message")
    public ResponseEntity<Map<String, String>> getMessageFromDialogflow(
            @RequestParam("query") String query,
            @RequestParam(value = "sessionId", defaultValue = "test-session") String sessionId) {
        try {
            DialogflowResult dialogflowResult = dialogflowService.sendMessageToDialogflow(query, sessionId);

            String intent = dialogflowResult.getIntent();
            String answer = dialogflowResult.getAnswer();
            String person = dialogflowResult.getPerson();
            String outputContext = dialogflowResult.getOutputContext();
            String dialogflowResultLocation = dialogflowResult.getLocation();

            Map<String, String> response = Map.of(
                    "intent", intent,
                    "message", answer,
                    "person", person == null ? "" : person,
                    "outputContext", outputContext == null ? "" : outputContext,
                    "dialogLocation", dialogflowResultLocation == null ? "" : dialogflowResultLocation
            );

            ObjectMapper objectMapper = new ObjectMapper(); // ✅ 추가
            String jsonResponse = objectMapper.writeValueAsString(response); // ✅ Map -> JSON 변환

            Iterator<SseEmitter> iterator = emitters.iterator();
            while (iterator.hasNext()) {
                SseEmitter emitter = iterator.next();
                try {
                    emitter.send(SseEmitter.event()
                            .name("intent")
                            .data(jsonResponse)); // ✅ JSON 문자열 전송
                    System.out.println("📤 이벤트 전송 성공 → " + intent);
                } catch (IOException e) {
                    System.out.println("❌ 이벤트 전송 실패 → emitter 제거");
                    emitter.completeWithError(e);
                    iterator.remove();
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("intent", "fallback", "message", "Dialogflow 오류: " + e.getMessage())
            );
        }
    }

    // ping
    @Scheduled(fixedRate = 10000)
    public void sendPingToClients() {
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("ping").data("💓"));
                System.out.println("📡 ping 전송 성공 → 현재 연결 수: " + emitters.size());
            } catch (IOException | IllegalStateException e) {
                System.out.println("⚠️ ping 실패 → emitter 제거");
                emitter.completeWithError(e);  // 안전하게 종료
                deadEmitters.add(emitter);     // 죽은 emitter 모으기
            }
        }

        emitters.removeAll(deadEmitters);
    }

    // ✅ POST Webhook용
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody Map<String, Object> body) {
        System.out.println("🤖 Dialogflow 요청 수신: " + body);

        Map<String, Object> queryResult = (Map<String, Object>) body.get("queryResult");

        String fulfillmentText = "";

        // 1. 직접 필드로 들어온 경우 우선
        if (queryResult.containsKey("fulfillmentText")) {
            fulfillmentText = (String) queryResult.get("fulfillmentText");
        }

        // 2. 없거나 빈 경우엔 메시지 배열에서 수동 추출
        if (fulfillmentText == null || fulfillmentText.trim().isEmpty()) {
            List<Map<String, Object>> messages = (List<Map<String, Object>>) queryResult.get("fulfillmentMessages");
            if (messages != null && !messages.isEmpty()) {
                Map<String, Object> firstMessage = messages.get(0);
                if (firstMessage.containsKey("text")) {
                    Map<String, Object> text = (Map<String, Object>) firstMessage.get("text");
                    List<String> textList = (List<String>) text.get("text");
                    if (textList != null && !textList.isEmpty()) {
                        fulfillmentText = textList.get(0);
                    }
                }
            }
        }

        System.out.println("💬 Dialogflow 응답: " + fulfillmentText);

        Map<String, Object> response = new HashMap<>();
        response.put("fulfillmentText", fulfillmentText);

        return ResponseEntity.ok(response);
    }

    // 트리거 테스트
    @GetMapping("/triggerEvent")
    public ResponseEntity<Map<String, String>> triggerEvent(
            @RequestParam String event,
            @RequestParam(required = false) String code,
            @RequestParam(value = "sessionId", defaultValue = "test-session") String sessionId) {
        try {
            String message = dialogflowService.triggerEvent(event, sessionId, code);

            return ResponseEntity.ok(Map.of(
                    "intent", event,
                    "message", message
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("intent", "fallback", "message", "Dialogflow 오류: " + e.getMessage())
            );
        }
    }
}
