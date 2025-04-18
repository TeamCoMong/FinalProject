package com.studymate.back.service;

import com.studymate.back.entity.Guardian;
import com.studymate.back.entity.User;
import com.studymate.back.repository.GuardianRepository;
import com.studymate.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GuardianService {
    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void registerGuardian(String guardianId, String email, String rawPassword, String userId) {
        if (guardianRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }

        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("해당 userId의 사용자가 존재하지 않습니다."));

        Guardian guardian = Guardian.builder()
                .guardianId(guardianId)
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .user(user)
                .build();

        guardianRepository.save(guardian);
    }
}
