package com.studymate.back.service;

import com.studymate.back.dto.SignupRequestDto;
import com.studymate.back.dto.UserResponseDto;
import com.studymate.back.entity.User;
import com.studymate.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public void signup(SignupRequestDto requestDto) {
        if (userRepository.findByUserId(requestDto.getUserId()).isPresent()) {
            throw new RuntimeException("이미 존재하는 사용자입니다.");
        }

        User user = User.builder()
                .userId(requestDto.getUserId())
                .name(requestDto.getName())
                .build();

        userRepository.save(user);
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
