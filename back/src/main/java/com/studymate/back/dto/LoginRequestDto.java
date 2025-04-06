package com.studymate.back.dto;

import lombok.*;

@Getter
@Setter
public class LoginRequestDto {
    private String userId;
    private String password;
}