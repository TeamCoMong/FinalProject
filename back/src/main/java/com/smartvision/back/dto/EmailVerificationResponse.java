package com.smartvision.back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * 이메일 인증 결과를 반환하는 DTO
 */
@Getter
@Setter
@AllArgsConstructor
public class EmailVerificationResponse {
    private boolean success; // ✅ 성공 여부 추가
    private String message;  // ✅ 결과 메시지
}
