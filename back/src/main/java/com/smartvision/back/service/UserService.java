package com.smartvision.back.service;

import com.smartvision.back.dto.*;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserSignupResponseDto signup(UserSignupRequestDto dto) {
        String generatedUserId = UUID.randomUUID().toString().substring(0, 8).toUpperCase(); // 예: ABCD1234

        User user = User.builder()
                .userId(generatedUserId)
                .name(dto.getName())
                .phone(dto.getPhone())
                .build();

        User savedUser = userRepository.save(user);

        return UserSignupResponseDto.builder()
                .userId(savedUser.getUserId())
                .name(savedUser.getName())
                .phone(savedUser.getPhone())
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

    // 로그인 처리 메소드 추가
    public UserResponseDto login(String userId) {
        // 클라이언트에서 Face ID 인증을 처리했다고 가정하고,
        // User ID에 해당하는 사용자가 존재하는지 확인 후, 존재하면 로그인 성공
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

        // 여기서 실제 Face ID 인증 처리 코드가 들어가야 하는 부분입니다.
        // Face ID 인증 성공 후, 인증된 사용자 정보를 리턴합니다.

        return new UserResponseDto(user); // 인증 성공 후 사용자 정보 반환
    }

    // 관리자화면에서 사용자 목록 불러오는 메서드
    public List<UserSimpleDto> getAllUser() {
        return userRepository.findAll().stream()
                .map(user -> new UserSimpleDto(user.getUserId(), user.getName(), user.getPhone()))
                .collect(Collectors.toList());
    }
}
