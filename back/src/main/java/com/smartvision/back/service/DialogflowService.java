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
    private static final String LANGUAGE_CODE = "ko";

    public String sendMessageToDialogflow(String userMessage, String sessionId) throws Exception {
        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(CREDENTIALS_PATH));
        SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        try (SessionsClient sessionsClient = SessionsClient.create(sessionsSettings)) {
            SessionName session = SessionName.of(PROJECT_ID, sessionId);

            TextInput textInput = TextInput.newBuilder()
                    .setText(userMessage)
                    .setLanguageCode(LANGUAGE_CODE)
                    .build();

            QueryInput queryInput = QueryInput.newBuilder().setText(textInput).build();

            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(session.toString())
                    .setQueryInput(queryInput)
                    .build();

            DetectIntentResponse response = sessionsClient.detectIntent(request);
            QueryResult result = response.getQueryResult();

            System.out.println("📨 사용자 입력: " + userMessage);
            System.out.println("🔍 인텐트 이름: " + result.getIntent().getDisplayName());
            System.out.println("📈 Confidence: " + result.getIntentDetectionConfidence());
            System.out.println("💬 Fulfillment Text: " + result.getFulfillmentText());
            System.out.println("📦 전체 응답 객체: " + result);

            return result.getFulfillmentText();
        }
    }

    public String triggerEvent(String eventName, String sessionId) throws Exception {

        // 로그인 시
//        String sessionId = user.getId(); // 로그인한 사용자 기준 고정된 세션 ID 사용
//        SessionsClient sessionsClient = SessionsClient.create();
//        SessionName session = SessionName.of(PROJECT_ID, sessionId);

        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(CREDENTIALS_PATH));
        SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        try (SessionsClient sessionsClient = SessionsClient.create(sessionsSettings)) {
            SessionName session = SessionName.of(PROJECT_ID, sessionId);

            EventInput eventInput = EventInput.newBuilder()
                    .setName(eventName)
                    .setLanguageCode(LANGUAGE_CODE)
                    .build();

            QueryInput queryInput = QueryInput.newBuilder().setEvent(eventInput).build();

            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(session.toString())
                    .setQueryInput(queryInput)
                    .build();

            DetectIntentResponse response = sessionsClient.detectIntent(request);
            return response.getQueryResult().getFulfillmentText();
        }
    }
}

