package com.studymate.back.repository;

import com.studymate.back.entity.Guardian;
import com.studymate.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuardianRepository extends JpaRepository<Guardian, String> {
    Optional<Guardian> findByEmail(String email);

    Optional<Guardian> findByGuardianId(String guardianId);
    Optional<Guardian> findByUser(User user); // 가디언 아이디 찾아주는 메소드
}
