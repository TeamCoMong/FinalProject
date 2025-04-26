package com.smartvision.back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GuardianLoginRequestDto {
    private String guardianId;
    private String password;
}