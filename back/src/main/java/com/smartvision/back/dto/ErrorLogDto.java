package com.studymate.back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorLogDto {
    private String userId;
    private String errorType;
    private String errorContext;
}