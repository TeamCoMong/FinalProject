package com.studymate.back.controller;

import com.studymate.back.dto.ErrorLogDto;
import com.studymate.back.dto.NotificationDto;
import com.studymate.back.service.ErrorLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/errors")
public class ErrorLogController {
    private final ErrorLogService errorLogService;

    @PostMapping
    public ResponseEntity<String> reportError(@RequestBody ErrorLogDto dto) {
        errorLogService.logErrorAndNotify(dto);
        return ResponseEntity.ok("에러 기록 및 알림 전송 완료");
    }
//    @GetMapping("/guardian/{guardianId}/notifications")
//    public List<NotificationDto> getNotifications(@PathVariable String guardianId) {
//        return notificationService.getNotificationsForGuardian(guardianId);
//    }
}
