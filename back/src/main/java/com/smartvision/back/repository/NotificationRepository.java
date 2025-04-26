package com.smartvision.back.repository;

import com.smartvision.back.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByGuardian_GuardianId(String guardianId);
}
