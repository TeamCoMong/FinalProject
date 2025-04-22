package com.studymate.back.service;

import com.studymate.back.dto.GuardianSignupRequestDto;
import com.studymate.back.entity.Guardian;
import com.studymate.back.entity.User;
import com.studymate.back.repository.GuardianRepository;
import com.studymate.back.repository.UserRepository;
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

    public void deleteGuardian(String guardianId) {
        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new RuntimeException("해당 보호자가 존재하지 않습니다."));
        guardianRepository.delete(guardian);
    }
}
