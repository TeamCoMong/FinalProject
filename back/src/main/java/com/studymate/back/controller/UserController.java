// UserController.java
package com.studymate.back.controller;

import com.studymate.back.dto.*;
import com.studymate.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<UserSignupResponseDto> signup(@RequestBody UserSignupRequestDto dto) {
        UserSignupResponseDto response = userService.signup(dto);
        return ResponseEntity.ok(response);
    }

    // 로그인 API (실제 인증은 클라이언트에서 처리)
    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(@RequestBody String userId) {
        // 여기서 Face ID는 클라이언트에서 이미 인증이 완료되었다고 가정하고
        // 전달된 userId를 기반으로 유효한 사용자인지 확인
        UserResponseDto response = userService.login(userId);

        return ResponseEntity.ok(response);
    }
}