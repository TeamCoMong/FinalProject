package com.smartvision.back.dto;

public class DialogflowResult {
    private final String intent;
    private final String answer;
    private final String person;

    public DialogflowResult(String intent, String answer, String person) {
        this.intent = intent;
        this.answer = answer;
        this.person = person;
    }

    public String getIntent() {
        return intent;
    }

    public String getAnswer() {
        return answer;
    }

    public String getPerson() {
        return person;
    }
}