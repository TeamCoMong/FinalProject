package com.smartvision.back.service;

import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.GuardianUserRelation;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.GuardianRepository;
import com.smartvision.back.repository.GuardianUserRelationRepository;
import com.smartvision.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuardianUserRelationService {

    private final GuardianUserRelationRepository relationRepository;
    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;

    // 보호자와 사용자를 연결 (relation 생성)
    @Transactional
    public GuardianUserRelation linkGuardianToUser(String guardianId, String userId, String relationType, boolean isPrimary) {
        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new RuntimeException("보호자를 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GuardianUserRelation relation = GuardianUserRelation.builder()
                .guardian(guardian)
                .user(user)
                .relationType(relationType)
                .regDate(LocalDateTime.now())
                .isPrimaryGuardian(isPrimary ? "Y" : "N")
                .build();

        return relationRepository.save(relation);
    }

    // 보호자 ID로 연결된 사용자 관계 조회
    @Transactional(readOnly = true)
    public List<GuardianUserRelation> getUsersByGuardianId(String guardianId) {
        return relationRepository.findByGuardian_GuardianId(guardianId);
    }

    // 사용자 ID로 연결된 보호자 관계 조회
    @Transactional(readOnly = true)
    public List<GuardianUserRelation> getGuardiansByUserId(String userId) {
        return relationRepository.findByUser_UserId(userId);
    }

    // 보호자 ID로 모든 연결 삭제
    @Transactional
    public void deleteByGuardianId(String guardianId) {
        relationRepository.deleteByGuardian_GuardianId(guardianId);
    }

    // 사용자 ID로 모든 연결 삭제
    @Transactional
    public void deleteByUserId(String userId) {
        relationRepository.deleteByUser_UserId(userId);
    }

    // 보호자와 사용자 연결(간단버전, relationType="보호자", 기본 보호자 설정X)
    @Transactional
    public void linkUser(String guardianId, String userId) {
        linkGuardianToUser(guardianId, userId, "보호자", false);
    }

    // 보호자와 사용자 연결 해제 (1건 삭제)
    @Transactional
    public void unlinkUser(String guardianId, String userId) {
        List<GuardianUserRelation> relations = relationRepository.findByGuardian_GuardianId(guardianId);
        for (GuardianUserRelation relation : relations) {
            if (relation.getUser().getUserId().equals(userId)) {
                relationRepository.delete(relation);
                break;
            }
        }
    }
}

