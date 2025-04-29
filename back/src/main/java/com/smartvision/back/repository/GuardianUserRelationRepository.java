package com.smartvision.back.repository;

import com.smartvision.back.entity.GuardianUserRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GuardianUserRelationRepository extends JpaRepository<GuardianUserRelation, Long> {

    // 보호자 ID로 연결된 사용자 목록 조회
    List<GuardianUserRelation> findByGuardian_GuardianId(String guardianId);

    // 사용자 ID로 연결된 보호자 목록 조회
    List<GuardianUserRelation> findByUser_UserId(String userId);

    // 보호자 ID로 연결된 모든 관계 삭제
    void deleteByGuardian_GuardianId(String guardianId);

    // 사용자 ID로 연결된 모든 관계 삭제
    void deleteByUser_UserId(String userId);
}
