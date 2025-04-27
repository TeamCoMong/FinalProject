package com.smartvision.back.dto;

public class DialogflowResult {
    private final String intent;
    private final String answer;

    public DialogflowResult(String intent, String answer) {
        this.intent = intent;
        this.answer = answer;
    }

    public String getIntent() {
        return intent;
    }

    public String getAnswer() {
        return answer;
    }
}