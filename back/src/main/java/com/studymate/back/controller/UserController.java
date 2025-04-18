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
    public ResponseEntity<?> signup(@RequestBody SignupRequestDto requestDto) {
        userService.signup(requestDto);
        return ResponseEntity.ok("회원가입 성공");
    }

//    @PostMapping("/login")
//    public ResponseEntity<UserResponseDto> login(@RequestBody LoginRequestDto requestDto) {
//        return ResponseEntity.ok(userService.login(requestDto));
//    }
}