package com.studymate.back.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GuardianRelationDto {
    private Long relationId;
    private String guardianId;
    private String disabledId;
    private String relationType;
    private String isPrimaryGuardian;
    private LocalDateTime regDate;
}
