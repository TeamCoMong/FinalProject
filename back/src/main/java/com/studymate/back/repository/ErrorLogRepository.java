package com.studymate.back.repository;

import com.studymate.back.entity.ErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, String> {
    List<ErrorLog> findByUser_UserId(String userId);
}
