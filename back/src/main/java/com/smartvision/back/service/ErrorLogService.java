package com.smartvision.back.service;

import com.smartvision.back.dto.ErrorLogDto;
import com.smartvision.back.entity.ErrorLog;
import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.Notification;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.ErrorLogRepository;
import com.smartvision.back.repository.GuardianRepository;
import com.smartvision.back.repository.NotificationRepository;
import com.smartvision.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ErrorLogService {
    private final ErrorLogRepository errorLogRepository;
    private final NotificationRepository notificationRepository;
    private final GuardianRepository guardianRepository;
    private final UserRepository userRepository;

    public void logErrorAndNotify(ErrorLogDto dto) {
        // 1. 유저 확인
        User user = userRepository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("해당 사용자 없음"));

        // ✅ 5분 이내 중복 체크 (int로 받아서 == 1 비교)
        int recentCount = errorLogRepository.existsRecentError(user.getUserId(), dto.getErrorType());
        if (recentCount == 1) {
            System.out.println("⚠️ 최근 5분 이내 동일 에러 발생 기록 있음 - 중복 저장 방지됨");
            return;
        }

        // 2. 에러 로그 저장
        ErrorLog errorLog = ErrorLog.builder()
                .errorId(UUID.randomUUID().toString())
                .user(user)
                .errorType(dto.getErrorType())
                .errorContext(dto.getErrorContext())
                .build();

        errorLogRepository.save(errorLog);

        // 3. 보호자 찾기
        Guardian guardian = guardianRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("해당 유저의 보호자 없음"));

        // 4. 알림 저장
        Notification notification = Notification.builder()
                .notificationId(UUID.randomUUID().toString())
                .guardian(guardian)
                .errorLog(errorLog)
                .build();

        notificationRepository.save(notification);

        // 5. (옵션) 푸시 알림 or WebSocket 전송
        // pushService.sendToGuardian(guardian.getEmail(), "에러 발생: " + dto.getErrorType());
    }
}
