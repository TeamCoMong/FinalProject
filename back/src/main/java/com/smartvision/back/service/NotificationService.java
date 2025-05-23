package com.smartvision.back.service;

import com.smartvision.back.dto.NotificationDto;
import com.smartvision.back.entity.Notification;
import com.smartvision.back.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // 특정 보호자의 모든 알림 조회
    public List<NotificationDto> getNotificationsForGuardian(String guardianId) {
        List<Notification> notifications = notificationRepository.findByGuardian_GuardianId("N");
        return notifications.stream()
                .map(NotificationDto::new)
                .collect(Collectors.toList());
    }

}
