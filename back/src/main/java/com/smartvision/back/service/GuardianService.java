package com.smartvision.back.service;

import com.smartvision.back.config.JwtProvider;
import com.smartvision.back.dto.EmailVerificationRequest;
import com.smartvision.back.dto.GuardianResponseDto;
import com.smartvision.back.dto.GuardianSignupRequestDto;
import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.GuardianRepository;
import com.smartvision.back.repository.UserRepository;
import com.smartvision.back.utils.EmailUtil;  // 이메일 유틸
import com.smartvision.back.utils.RedisEmailAuthentication;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
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
    private final RedisEmailAuthentication redisEmailAuthentication;
    private static final long CODE_EXPIRE_MINUTES = 5; // 인증코드 만료 시간 (5분)

    // 아이디 중복 확인
    public boolean checkUsername(String username) {
        Optional<Guardian> guardian = guardianRepository.findByGuardianId(username);
        if (guardian.isPresent()) {
            System.out.println("아이디 중복: " + username);
            return false;
        }
        return true;
    }

    /**
     * 이메일 인증코드 전송
     */
    public void sendVerificationEmail(EmailVerificationRequest email) throws MessagingException, UnsupportedEncodingException {
        String code = emailUtil.generateVerificationCode(); // 인증 코드 생성
        emailUtil.sendVerificationEmail(email, code); // 이메일 발송
        redisEmailAuthentication.setEmailAuthenticationExpire(email.getEmail(), code, CODE_EXPIRE_MINUTES);
    }

    /**
     * 이메일 인증 코드 검증
     */
    public boolean verifyEmail(EmailVerificationRequest request) {
        String storedCode = redisEmailAuthentication.getEmailAuthenticationCode(request.getEmail());

        if (storedCode != null && storedCode.equalsIgnoreCase(request.getCode().trim())) {
            redisEmailAuthentication.setEmailAuthenticationComplete(request.getEmail()); // 인증 완료 처리
            return true;
        } else {
            return false;
        }
    }

    // 회원가입
    public GuardianSignupRequestDto signup(GuardianSignupRequestDto dto) {
        User user = userRepository.findByUserId(dto.getUserCode())
                .orElseThrow(() -> new RuntimeException("해당 사용자 없음"));

        Guardian guardian = Guardian.builder()
                .guardianId(dto.getGuardianId() != null ? dto.getGuardianId() : UUID.randomUUID().toString())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .phone(dto.getPhone()) // ✅ 전화번호 추가
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

        System.out.println("로그인 성공: " + guardianId);

        String accessToken = jwtProvider.generateAccessToken(guardianId);
        String refreshToken = jwtProvider.generateRefreshToken(guardianId);

        return GuardianResponseDto.builder()
                .guardianId(guardian.getGuardianId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
