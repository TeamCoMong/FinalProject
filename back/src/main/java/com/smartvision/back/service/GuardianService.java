package com.smartvision.back.service;

import com.smartvision.back.config.JwtProvider;
import com.smartvision.back.dto.GuardianResponseDto;
import com.smartvision.back.dto.GuardianSignupRequestDto;
import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.GuardianRepository;
import com.smartvision.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuardianService {
    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    public void signup(GuardianSignupRequestDto dto) {
        // 이메일 인증로직 구현 필요
//        if (guardianRepository.findByEmail(email).isPresent()) {
//            throw new RuntimeException("이미 등록된 이메일입니다.");
//        }

        // 1. 유저 존재 확인
        User user = userRepository.findByUserId(dto.getUserCode())
                .orElseThrow(() -> new RuntimeException("해당 사용자 없음"));

        // 2. 보호자 저장
        Guardian guardian = Guardian.builder()
                .guardianId(dto.getGuardianId() != null ? dto.getGuardianId() : UUID.randomUUID().toString())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .user(user)
                .build();

        guardianRepository.save(guardian);
    }

    public GuardianResponseDto login(String guardianId, String password) {
        System.out.println("로그인 시도: " + guardianId);  // 로그 출력
        Guardian guardian = guardianRepository.findByGuardianId(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));
        // 비밀번호 검증
        if (!passwordEncoder.matches(password, guardian.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // ✅ 연결된 사용자 코드 받아오기
        String userId = guardian.getUser().getUserId();
        // 로그 출력
        System.out.println("로그인 성공: " + guardianId);
        // ✅ JWT 발급
        String accessToken = jwtProvider.generateAccessToken(guardianId);
        String refreshToken = jwtProvider.generateRefreshToken(guardianId);

        return GuardianResponseDto.builder()
                .guardianId(guardian.getGuardianId())
                .userId(userId)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
