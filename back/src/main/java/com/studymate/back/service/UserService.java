package com.studymate.back.service;

import com.studymate.back.dto.SignupRequestDto;
import com.studymate.back.dto.UserResponseDto;
import com.studymate.back.dto.UserSignupRequestDto;
import com.studymate.back.dto.UserSignupResponseDto;
import com.studymate.back.entity.User;
import com.studymate.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserSignupResponseDto signup(UserSignupRequestDto dto) {
        String generatedUserId = UUID.randomUUID().toString().substring(0, 8).toUpperCase(); // 예: ABCD1234

        User user = User.builder()
                .userId(generatedUserId)
                .name(dto.getName())
                .build();

        User savedUser = userRepository.save(user);

        return UserSignupResponseDto.builder()
                .userId(savedUser.getUserId())
                .name(savedUser.getName())
                .createdAt(savedUser.getCreatedAt().toString())
                .build();
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponseDto::new)
                .toList();
    }

    public UserResponseDto getUserByUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        return new UserResponseDto(user);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    public boolean existsByUserId(String userId) {
        return userRepository.findByUserId(userId).isPresent();
    }
}
