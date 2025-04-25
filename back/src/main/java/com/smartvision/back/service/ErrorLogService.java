package com.studymate.back.service;

import com.studymate.back.dto.ErrorLogDto;
import com.studymate.back.entity.ErrorLog;
import com.studymate.back.entity.Guardian;
import com.studymate.back.entity.Notification;
import com.studymate.back.entity.User;
import com.studymate.back.repository.ErrorLogRepository;
import com.studymate.back.repository.GuardianRepository;
import com.studymate.back.repository.NotificationRepository;
import com.studymate.back.repository.UserRepository;
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

        // ✅ 5분 이내 중복 체크
        boolean isRecentDuplicate = errorLogRepository.existsRecentError(user.getUserId(), dto.getErrorType());
        if (isRecentDuplicate) {
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
        Guardian guardian = guardianRepository.findByUser(user)
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
