package com.smartvision.back.controller;

import com.smartvision.back.dto.GuardianLoginRequestDto;
import com.smartvision.back.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminRepository adminRepository;

    // ✅ 1차 로그인 (ID, PW 검증)
    @PostMapping("/login")
    public ResponseEntity<?> firstLogin(@RequestBody GuardianLoginRequestDto dto) {
        if (dto.getGuardianId() == null || dto.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "아이디 또는 비밀번호가 누락되었습니다."));
        }

        return adminRepository.findById(dto.getGuardianId())
                .map(admin -> {
                    boolean isValid = BCrypt.checkpw(dto.getPassword(), admin.getPasswordHash());
                    if (isValid) {
                        return ResponseEntity.ok(Map.of(
                                "step", 1,
                                "adminId", admin.getAdminId()
                        ));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "아이디 또는 비밀번호가 잘못되었습니다."));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "아이디 또는 비밀번호가 잘못되었습니다.")));
    }

    // ✅ 2차 비밀번호 검증
    @PostMapping("/verify-second-pw")
    public ResponseEntity<?> verifySecondPw(@RequestBody Map<String, String> body) {
        String adminId = body.get("adminId");
        String secondPw = body.get("secondPw");

        if (adminId == null || secondPw == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "필수 입력값이 없습니다."));
        }

        return adminRepository.findById(adminId)
                .map(admin -> {
                    if (secondPw.equals(admin.getSecondPw())) {
                        return ResponseEntity.ok(Map.of("success", true));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "2차 비밀번호가 틀렸습니다."));
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "관리자를 찾을 수 없습니다.")));
    }
}
