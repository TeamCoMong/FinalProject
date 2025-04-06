package com.studymate.back.service;
import com.studymate.back.dto.*;
import com.studymate.back.entity.GuardianRelation;
import com.studymate.back.entity.User;
import com.studymate.back.repository.GuardianRelationRepository;
import com.studymate.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GuardianRelationService {

    private final GuardianRelationRepository relationRepository;
    private final UserRepository userRepository;

    public void addRelation(String guardianId, String disabledId, String relationType, String isPrimaryGuardian) {
        User guardian = userRepository.findByUserId(guardianId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 보호자입니다."));
        User disabled = userRepository.findByUserId(disabledId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 시각장애인입니다."));

        if (!"GUARDIAN".equals(guardian.getUserType()) || !"DISABLED".equals(disabled.getUserType())) {
            throw new RuntimeException("사용자 타입이 올바르지 않습니다.");
        }

        GuardianRelation relation = GuardianRelation.builder()
                .guardian(guardian)
                .disabled(disabled)
                .relationType(relationType)
                .isPrimaryGuardian(isPrimaryGuardian)
                .build();

        relationRepository.save(relation);
    }

    public List<GuardianRelationDto> getRelationsByGuardian(String guardianId) {
        User guardian = userRepository.findByUserId(guardianId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 보호자입니다!!."));
        return relationRepository.findByGuardian(guardian).stream()
                .map(r -> GuardianRelationDto.builder()
                        .relationId(r.getRelationId())
                        .guardianId(r.getGuardian().getUserId())
                        .disabledId(r.getDisabled().getUserId())
                        .relationType(r.getRelationType())
                        .isPrimaryGuardian(r.getIsPrimaryGuardian())
                        .regDate(r.getRegDate())
                        .build())
                .toList();
    }
}

