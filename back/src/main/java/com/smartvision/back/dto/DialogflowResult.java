package com.smartvision.back.dto;

public class DialogflowResult {
    private final String intent;
    private final String answer;
    private final String person;
    private final String outputContext;
    private final String loca;

    public DialogflowResult(String intent, String answer, String person, String outputContext, String location) {
        this.intent = intent;
        this.answer = answer;
        this.person = person;
        this.outputContext  = outputContext;
        this.loca = location;
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

    public String getLocation() { return loca; }
}