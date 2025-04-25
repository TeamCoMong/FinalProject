package com.studymate.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GuardianResponseDto {
    private String guardianId;
    private String userId;
}