package com.smartvision.back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BiometricLoginRequestDto {
    private String userId; // ✅ 지문 인증으로 넘어오는 userId
}
