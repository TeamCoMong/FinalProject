package com.smartvision.back.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;

import com.smartvision.back.dto.DialogflowResult;
import com.google.protobuf.Struct;
import com.google.protobuf.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class DialogflowService {

    private static final String PROJECT_ID = "j--fmtv";
    private static final String CREDENTIALS_PATH = "C:/ngrok/j--fmtv-7b0423872e2c.json"; //
    private static final String LANGUAGE_CODE = "ko";


    private String extractPersonName(Struct parameters) {
        if (parameters == null) return null;
        Value personValue = parameters.getFieldsOrDefault("person", null);
        if (personValue == null || personValue.getKindCase() != Value.KindCase.STRUCT_VALUE) {
            return null;
        }
        Struct personStruct = personValue.getStructValue();
        Value nameValue = personStruct.getFieldsOrDefault("name", null);
        if (nameValue == null || nameValue.getKindCase() != Value.KindCase.STRING_VALUE) {
            return null;
        }
        return nameValue.getStringValue();
    }

    public DialogflowResult sendMessageToDialogflow(String userMessage, String sessionId) throws Exception {
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

            Struct parameters = result.getParameters();

            String loca = parameters.getFieldsOrDefault("way", Value.newBuilder().setStringValue("").build()).getStringValue();

            String intent = result.getIntent().getDisplayName();
            String answer = result.getFulfillmentText();
            String personName = extractPersonName(result.getParameters());
            String outputContext  = "";
            if (!result.getOutputContextsList().isEmpty()) {
                String fullContextName = result.getOutputContexts(0).getName(); // projects/.../agent/sessions/.../contexts/awaiting_name
                outputContext  = fullContextName.substring(fullContextName.lastIndexOf("/") + 1);
            }


            System.out.println("📨 사용자 입력: " + userMessage);
            System.out.println("🔍 인텐트 이름: " + intent);
            System.out.println("💬 Fulfillment Text: " + answer);
            System.out.println("🙋 인식된 이름 (person): " + personName);
            System.out.println("📦 Output Contexts: " + outputContext );
            System.out.println("Parameter: " + loca);

            return new DialogflowResult(intent, answer, personName, outputContext, loca);
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

