package com.smartvision.back.dto;

import com.smartvision.back.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private String userId;
    private String name;
    private String accessToken;
    private String refreshToken;

    private boolean isAuthenticated; // 인증 상태 추가

    // 기존 생성자
    public UserResponseDto(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
        this.isAuthenticated = true;  // 인증이 성공했다고 가정
    }

    // 인증 실패 상태를 반환할 때 사용할 생성자
    public UserResponseDto(String userId, boolean isAuthenticated) {
        this.userId = userId;
        this.isAuthenticated = isAuthenticated;
    }
}
