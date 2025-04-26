package com.smartvision.back.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;

import com.google.protobuf.Struct;
import com.google.protobuf.Value;
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

    public String triggerEvent(String eventName, String sessionId, String code) throws Exception {

        GoogleCredentials credentials = GoogleCredentials.fromStream(new FileInputStream(CREDENTIALS_PATH));
        SessionsSettings sessionsSettings = SessionsSettings.newBuilder()
                .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                .build();

        try (SessionsClient sessionsClient = SessionsClient.create(sessionsSettings)) {
            SessionName session = SessionName.of(PROJECT_ID, sessionId);

            EventInput.Builder eventInputBuilder = EventInput.newBuilder()
                    .setName(eventName)
                    .setLanguageCode(LANGUAGE_CODE);

            // ✅ 특정 이벤트일 때만 파라미터 추가
            if ("signup_complete".equals(eventName) && code != null && !code.isEmpty()) {
                Struct parameters = Struct.newBuilder()
                        .putFields("code", Value.newBuilder().setStringValue(code).build())
                        .build();
                eventInputBuilder.setParameters(parameters);
                System.out.println("전달 코드: " + code);
            }

            QueryInput queryInput = QueryInput.newBuilder()
                    .setEvent(eventInputBuilder.build())
                    .build();

            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(session.toString())
                    .setQueryInput(queryInput)
                    .build();

            DetectIntentResponse response = sessionsClient.detectIntent(request);
            return response.getQueryResult().getFulfillmentText();
        }
    }
}

