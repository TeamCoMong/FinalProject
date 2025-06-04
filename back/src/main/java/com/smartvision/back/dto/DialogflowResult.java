package com.smartvision.back.dto;

public class DialogflowResult {
    private final String intent;
    private final String answer;
    private final String person;
    private final String outputContext;

    public DialogflowResult(String intent, String answer, String person, String outputContext) {
        this.intent = intent;
        this.answer = answer;
        this.person = person;
        this.outputContext  = outputContext;
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

    public String getOutputContext() {
        return outputContext;
    }
}