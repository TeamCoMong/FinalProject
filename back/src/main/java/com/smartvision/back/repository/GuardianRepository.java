package com.smartvision.back.repository;

import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardian, String> {

    Optional<Guardian> findByGuardianId(String guardianId);
    // 수정: User의 userId를 통해 찾는다
    Optional<Guardian> findByUser_UserId(String userId);
}
