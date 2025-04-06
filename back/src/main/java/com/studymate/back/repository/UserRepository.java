// UserRepository.java
package com.studymate.back.repository;

import com.studymate.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUserId(String userId);
    Optional<User> findByPhone(String phone);
}
