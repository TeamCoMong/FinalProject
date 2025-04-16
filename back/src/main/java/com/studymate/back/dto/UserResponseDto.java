package com.studymate.back.dto;

import com.studymate.back.entity.User;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class UserResponseDto {
//    private String token;
    private String userId;
    private String password;
    private String name;
    private String phone;
    private String userType;

    public UserResponseDto(User user) {
        this.userId = user.getUserId();
        this.phone = user.getPhone();
        this.name = user.getName();
        this.userType = user.getUserType();
    }

    public UserResponseDto(String userId) {
    }
}