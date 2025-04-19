package com.smartvision.back.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;

import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.util.UUID;

@Service
public class DialogflowService {

    private static final String PROJECT_ID = "j--fmtv";
    private static final String CREDENTIALS_PATH = "C:/ngrok/j--fmtv-7b0423872e2c.json"; //
    private static final String LANGUAGE_CODE = "en";

    public String sendMessageToDialogflow(String userMessage) throws Exception {
        // 인증 세팅
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(CREDENTIALS_PATH));
        SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        // 세션 생성
        try (SessionsClient sessionsClient = SessionsClient.create(sessionsSettings)) {
            String sessionId = UUID.randomUUID().toString();
            SessionName session = SessionName.of(PROJECT_ID, sessionId);

            // 사용자 입력 구성
            TextInput textInput = TextInput.newBuilder()
                    .setText(userMessage)
                    .setLanguageCode(LANGUAGE_CODE)
                    .build();

            QueryInput queryInput = QueryInput.newBuilder()
                    .setText(textInput)
                    .build();

            // 요청 보내기
            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(session.toString())
                    .setQueryInput(queryInput)
                    .build();

            // 응답 받기
            DetectIntentResponse response = sessionsClient.detectIntent(request);
            QueryResult result = response.getQueryResult();

            // 🔍 상세 로그 출력
            System.out.println("📨 사용자 입력: " + userMessage);
            System.out.println("🔍 인텐트 이름: " + result.getIntent().getDisplayName());
            System.out.println("📈 Confidence: " + result.getIntentDetectionConfidence());
            System.out.println("💬 Fulfillment Text: " + result.getFulfillmentText());
            System.out.println("📦 전체 응답 객체: " + result);

            return result.getFulfillmentText();
        }
    }
}