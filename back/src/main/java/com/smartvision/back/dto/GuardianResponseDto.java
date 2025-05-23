package com.smartvision.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GuardianResponseDto {
    private String guardianId;
    private String guardianName; // 이름 필드 추가
    private String accessToken;
    private String refreshToken;

    public GuardianResponseDto() {

    }
}