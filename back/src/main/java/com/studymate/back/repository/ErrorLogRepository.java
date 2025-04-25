package com.studymate.back.repository;

import com.studymate.back.entity.ErrorLog;
import com.studymate.back.entity.User;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, String> {
    List<ErrorLog> findByUser_UserId(String userId);
    boolean existsByUserAndErrorTypeAndResolvedIsFalse(User user, String errorType);
    @Query(value = "SELECT COUNT(*) > 0 FROM ERROR_LOG e JOIN USERS u ON e.user_id = u.user_id WHERE u.user_id = :userId AND e.error_type = :errorType AND e.timestamp >= SYSDATE - (5/1440)", nativeQuery = true)
    boolean existsRecentError(@Param("userId") String userId, @Param("errorType") String errorType);

}
