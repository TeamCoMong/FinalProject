// UserController.java
package com.smartvision.back.controller;

import com.smartvision.back.config.JwtProvider;
import com.smartvision.back.dto.*;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.UserRepository;
import com.smartvision.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtProvider jwtProvider; // ✅ JWT 토큰 발급해줄 컴포넌트

    @PostMapping(value = "/signup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserSignupResponseDto> signup(@RequestBody UserSignupRequestDto dto) {
        UserSignupResponseDto response = userService.signup(dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/biometric-login")
    public ResponseEntity<UserResponseDto> biometricLogin(@RequestBody BiometricLoginRequestDto request) {
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        String accessToken = jwtProvider.generateAccessToken(user.getUserId()); // ✅
        String refreshToken = jwtProvider.generateRefreshToken(user.getUserId()); // ✅

        UserResponseDto response = new UserResponseDto();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);

        return ResponseEntity.ok(response);
    }
}