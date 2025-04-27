package com.smartvision.back.controller;

import com.smartvision.back.dto.*;
import com.smartvision.back.service.EmailService;
import com.smartvision.back.service.GuardianService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guardians")

public class GuardianController {

    private final EmailService emailService;
    private final GuardianService guardianService;

    @PostMapping("/login")
    public ResponseEntity<GuardianResponseDto> login(@RequestBody GuardianLoginRequestDto requestDto) {
        GuardianResponseDto responseDto = guardianService.login(
                requestDto.getGuardianId(), requestDto.getPassword());
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/signup")
    public ResponseEntity<GuardianResponseDto> signup(@RequestBody GuardianSignupRequestDto dto) {
        guardianService.signup(dto);
        return ResponseEntity.ok(new GuardianResponseDto());
    }

    @PostMapping("/check-username")
    public ResponseEntity<UsernameCheckResponse> checkUsername(@RequestBody UsernameCheckRequest request) {
        boolean isAvailable = guardianService.checkUsername(request.getUsername());
        return ResponseEntity.ok(new UsernameCheckResponse(isAvailable));
    }

//    @PostMapping("/send-email-code")
//    public ResponseEntity<EmailVerificationResponse> sendVerificationEmail(@RequestBody EmailVerificationRequest request) {
//        guardianService.sendVerificationEmail(request.getEmail());
//        return ResponseEntity.ok(new EmailVerificationResponse("인증번호가 이메일로 전송되었습니다."));
//    }

    @PostMapping("/verify-email-code")
    public ResponseEntity<VerifyEmailResponse> verifyEmail(@RequestBody EmailVerificationRequest request) {
        boolean success = guardianService.verifyEmail(request);

        if (success) {
            return ResponseEntity.ok(new VerifyEmailResponse("이메일 인증이 완료되었습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new VerifyEmailResponse("인증 실패했습니다."));
        }
    }


    @PostMapping("/send-email-code")
    public ResponseEntity<Map<String, String>> sendEmailCode(@RequestBody Map<String, String> req) throws MessagingException, UnsupportedEncodingException {
        String email = req.get("email");
        String code = guardianService.sendVerificationEmail(email);
        return ResponseEntity.ok(Map.of(
                "message", "인증 코드가 전송되었습니다.",
                "code", code // 테스트용, 나중에 삭제해도 됨
        ));
    }
}
