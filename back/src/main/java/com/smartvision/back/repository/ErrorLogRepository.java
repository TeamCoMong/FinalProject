package com.smartvision.back.repository;

import com.smartvision.back.entity.ErrorLog;
import com.smartvision.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, String> {
    List<ErrorLog> findByUser_UserId(String userId);

    boolean existsByUserAndErrorTypeAndResolved(User user, String errorType, String resolved);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END " +
            "FROM ERROR_LOG e JOIN USERS u ON e.user_id = u.user_id " +
            "WHERE u.user_id = :userId " +
            "AND e.error_type = :errorType " +
            "AND e.timestamp >= SYSDATE - (5/1440)", nativeQuery = true)
    int existsRecentError(@Param("userId") String userId, @Param("errorType") String errorType);
}
