package com.studymate.back.repository;

import com.studymate.back.entity.GuardianRelation;
import com.studymate.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuardianRelationRepository extends JpaRepository<GuardianRelation, Long> {
    List<GuardianRelation> findByGuardian(User guardian);
    List<GuardianRelation> findByDisabled(User disabled);
    Optional<GuardianRelation> findByGuardianAndDisabled(User guardian, User disabled);
}
