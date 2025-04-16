// SignupRequestDto.java
package com.studymate.back.dto;

import lombok.*;

@Getter
@Setter
@Builder
public class SignupRequestDto {
    private String userId;
    private String password;
    private String name;
    private String phone;
    private String userType;
}
