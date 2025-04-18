package com.studymate.back.dto;

import com.studymate.back.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private String userId;
    private String name;

    public UserResponseDto(User user) {
        this.userId = user.getUserId();
        this.name = user.getName();
    }
}
