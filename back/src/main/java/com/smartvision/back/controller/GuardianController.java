package com.smartvision.back.controller;

import com.smartvision.back.dto.*;
import com.smartvision.back.entity.GuardianUserRelation;
import com.smartvision.back.exception.BadRequestException;
import com.smartvision.back.service.GuardianService;
import com.smartvision.back.service.GuardianUserRelationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.MessagingException;
import org.springframework.web.bind.annotation.*;
import java.io.UnsupportedEncodingException;
import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guardians")

public class GuardianController {

    private final GuardianService guardianService;
    private final GuardianUserRelationService relationService;

    @PostMapping("/login")
    public ResponseEntity<GuardianResponseDto> login(@RequestBody GuardianLoginRequestDto requestDto) {
        GuardianResponseDto responseDto = guardianService.login(
                requestDto.getGuardianId(), requestDto.getPassword());
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/signup")
    public ResponseEntity<GuardianSignupResponseDto> signup(@RequestBody GuardianSignupRequestDto dto) {
        guardianService.signup(dto);
        return ResponseEntity.ok(new GuardianSignupResponseDto(true, "회원가입이 완료되었습니다."));
    }

    @PostMapping("/check-username")
    public ResponseEntity<UsernameCheckResponse> checkUsername(@RequestBody UsernameCheckRequest request) {
        boolean isAvailable = guardianService.checkUsername(request.getUsername());
        return ResponseEntity.ok(new UsernameCheckResponse(isAvailable));
    }

    @PostMapping("/send-email-code")
    public ResponseEntity<EmailVerificationResponse> sendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        try {
            // 이메일 인증 코드 전송 처리 로직
            guardianService.sendVerificationEmail(request);

            // 성공적으로 이메일 인증 코드가 전송되었을 때 응답을 EmailVerificationResponse 객체로 반환
            EmailVerificationResponse response = new EmailVerificationResponse(false,"이메일 인증 코드가 전송되었습니다.");
            return ResponseEntity.ok(response);

        } catch (MessagingException | UnsupportedEncodingException e) {
            EmailVerificationResponse response = new EmailVerificationResponse(false,"이메일 전송 중 오류가 발생했습니다.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 이메일 인증코드 검증
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<EmailVerificationResponse> verifyEmailCode(@RequestBody EmailVerificationRequest request) {
        System.out.println("받은 이메일: " + request.getEmail());
        System.out.println("받은 인증번호: " + request.getCode());

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("이메일이 비어있습니다."); // ❗ 예외 던지기
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new BadRequestException("인증번호가 비어있습니다."); // ❗ 예외 던지기
        }

        boolean success = guardianService.verifyEmail(request);

        if (success) {
            return ResponseEntity.ok(new EmailVerificationResponse(true, "이메일 인증이 완료되었습니다."));
        } else {
            throw new BadRequestException("인증 실패했습니다."); // ❗ 예외 던지기
        }
    }
    // ✅ 내 연결된 사용자 조회
    @GetMapping("/{guardianId}/users")
    public ResponseEntity<List<UserSimpleDto>> getLinkedUsers(@PathVariable("guardianId")String guardianId) {
        List<GuardianUserRelation> relations = relationService.getUsersByGuardianId(guardianId);

        List<UserSimpleDto> users = relations.stream()
                .map(relation -> new UserSimpleDto(
                        relation.getUser().getUserId(),
                        relation.getUser().getName()
                ))
                .toList();

        return ResponseEntity.ok(users);
    }

    // ✅ 보호자 - 사용자 연결 (등록)
    @PostMapping("/{guardianId}/users/{userId}")
    public ResponseEntity<Void> linkUser(
            @PathVariable("guardianId") String guardianId,
            @PathVariable("userId") String userId
    ) {
        relationService.linkUser(guardianId, userId);
        return ResponseEntity.noContent().build(); // ✅ 204 No Content
    }

    // ✅ 보호자 - 사용자 연결 해제 (삭제)
    @DeleteMapping("/{guardianId}/users/{userId}")
    public ResponseEntity<Void> unlinkUser(
            @PathVariable("guardianId") String guardianId,
            @PathVariable("userId") String userId
    ) {
        relationService.unlinkUser(guardianId, userId);
        return ResponseEntity.noContent().build(); // ✅ 204 No Content
    }

}
