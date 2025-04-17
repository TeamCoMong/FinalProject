package com.studymate.back.controller;

import com.studymate.back.service.DialogflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dialogflow")
public class DialogflowController {

    private final DialogflowService dialogflowService;

    public DialogflowController(DialogflowService dialogflowService) {
        this.dialogflowService = dialogflowService;
    }

    // ✅ GET 테스트용
    @GetMapping("/message")
    public ResponseEntity<String> getMessageFromDialogflow(@RequestParam String query) {
        try {
            String answer = dialogflowService.sendMessageToDialogflow(query);
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Dialogflow 오류: " + e.getMessage());
        }
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
}
