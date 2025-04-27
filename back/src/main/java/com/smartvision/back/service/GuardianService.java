package com.smartvision.back.service;

import com.smartvision.back.config.JwtProvider;
import com.smartvision.back.dto.EmailVerificationRequest;
import com.smartvision.back.dto.GuardianResponseDto;
import com.smartvision.back.dto.GuardianSignupRequestDto;
import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.GuardianRepository;
import com.smartvision.back.repository.UserRepository;
import com.smartvision.back.utils.EmailUtil;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuardianService {

    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final EmailUtil emailUtil;  // 이메일 보내는 유틸

    // ✅ 메모리에 인증코드 저장할 Map 추가
    private final Map<String, String> verificationCodes = new HashMap<>();

    // 아이디 중복 확인
    public boolean checkUsername(String username) {
        Optional<Guardian> guardian = guardianRepository.findByGuardianId(username);
        if (guardian.isPresent()) {
            System.out.println("아이디 중복: " + username);
            return false;
        }
        return true;
    }

    // 이메일로 인증코드 전송
    public String sendVerificationEmail(String email) throws MessagingException, UnsupportedEncodingException {
        String code = createRandomCode();
        email = email.trim().toLowerCase(); // 여기 추가

        emailUtil.sendVerificationEmail(email, code);
        verificationCodes.put(email, code);  // 메모리에 저장
        return code;
    }

    public boolean verifyEmail(EmailVerificationRequest request) {
        String email = request.getEmail().trim().toLowerCase(); // 여기 toLowerCase 추가
        String inputCode = request.getCode().trim();

        String savedCode = verificationCodes.get(email);

        if (savedCode == null) {
            System.out.println("저장된 코드 없음: " + email);
            return false;
        }

        System.out.println("서버 저장 코드: " + savedCode + ", 입력한 코드: " + inputCode);

        return savedCode.equals(inputCode);
    }

    // 회원가입
    public GuardianSignupRequestDto signup(GuardianSignupRequestDto dto) {
        User user = userRepository.findByUserId(dto.getUserCode())
                .orElseThrow(() -> new RuntimeException("해당 사용자 없음"));

        Guardian guardian = Guardian.builder()
                .guardianId(dto.getGuardianId() != null ? dto.getGuardianId() : UUID.randomUUID().toString())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .user(user)
                .build();

        guardianRepository.save(guardian);
        return dto;
    }

    // 로그인
    public GuardianResponseDto login(String guardianId, String password) {
        System.out.println("로그인 시도: " + guardianId);
        Guardian guardian = guardianRepository.findByGuardianId(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));

        if (!passwordEncoder.matches(password, guardian.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        String userId = guardian.getUser().getUserId();
        System.out.println("로그인 성공: " + guardianId);

        String accessToken = jwtProvider.generateAccessToken(guardianId);
        String refreshToken = jwtProvider.generateRefreshToken(guardianId);

        return GuardianResponseDto.builder()
                .guardianId(guardian.getGuardianId())
                .userId(userId)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // 랜덤 6자리 코드 생성
    private String createRandomCode() {
        return String.valueOf((int)(Math.random() * 900000) + 100000);
    }
}
