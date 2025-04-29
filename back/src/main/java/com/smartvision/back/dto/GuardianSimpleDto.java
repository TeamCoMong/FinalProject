package com.smartvision.back.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GuardianSimpleDto {
    private String guardianId;
    private String guardianName;
    private String phone;
}