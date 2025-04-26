package com.smartvision.back.controller;

import com.smartvision.back.dto.NotificationDto;
import com.smartvision.back.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 보호자의 읽지 않은 알림 조회
    @GetMapping("/guardian/{guardianId}")
    public ResponseEntity<List<NotificationDto>> getNotifications(@PathVariable String guardianId) {
        List<NotificationDto> notifications = notificationService.getNotificationsForGuardian(guardianId);
        return ResponseEntity.ok(notifications);
    }

    // 알림 읽음 처리
    @PatchMapping("/{notificationId}")
    public ResponseEntity<String> markAsRead(@PathVariable String notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok("알림이 읽음으로 처리되었습니다.");
    }
}
