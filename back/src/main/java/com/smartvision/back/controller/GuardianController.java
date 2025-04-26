package com.smartvision.back.controller;

import com.smartvision.back.dto.GuardianLoginRequestDto;
import com.smartvision.back.dto.GuardianResponseDto;
import com.smartvision.back.service.GuardianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guardians")
public class GuardianController {

    private final GuardianService guardianService;

    @PostMapping("/login")
    public ResponseEntity<GuardianResponseDto> login(@RequestBody GuardianLoginRequestDto requestDto) {
        GuardianResponseDto responseDto = guardianService.login(
                requestDto.getGuardianId(), requestDto.getPassword());
        return ResponseEntity.ok(responseDto);
    }
}

