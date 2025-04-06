package com.studymate.back.controller;

import com.studymate.back.service.DialogflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dialogflow")
public class DialogflowController {

    private final DialogflowService dialogflowService;

    public DialogflowController(DialogflowService dialogflowService) {
        this.dialogflowService = dialogflowService;
    }

    // GET 요청으로 테스트: /dialogflow/message?query=원화관으로 가는 길
    @GetMapping("/message")
    public ResponseEntity<String> getMessageFromDialogflow(@RequestParam String query) {
        try {
            String answer = dialogflowService.sendMessageToDialogflow(query);
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Dialogflow 오류: " + e.getMessage());
        }
    }
}