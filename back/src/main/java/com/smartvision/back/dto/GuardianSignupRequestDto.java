package com.smartvision.back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuardianSignupRequestDto {
    private String guardianId;
    private String guardianName; // 이름 필드 추가
    private String email;
    private String password;
    private String userCode; // 사용자(장애인)의 USER_ID
    private String verificationCode;
    private String phone; // ✅ 전화번호 추가
}
