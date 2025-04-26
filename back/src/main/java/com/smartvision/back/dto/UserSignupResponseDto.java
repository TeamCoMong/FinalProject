package com.smartvision.back.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSignupResponseDto {
    private String userId;   // 생성된 사용자 코드 (UUID 기반)
    private String name;
    private String createdAt;
}
