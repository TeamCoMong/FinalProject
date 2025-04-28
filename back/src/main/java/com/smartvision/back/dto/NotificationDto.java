package com.smartvision.back.dto;

import com.smartvision.back.entity.Notification;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
public class NotificationDto {

    private String notificationId;
    private String errorId;
    private String errorType;
    private String errorContext;
    private String sentAt;
    private String read;

    public NotificationDto(Notification notification) {
        this.notificationId = notification.getNotificationId();
        this.errorId = notification.getError().getErrorId();
        this.errorType = notification.getError().getErrorType();
        this.errorContext = notification.getError().getErrorContext();
        this.sentAt = notification.getSentAt().toString();
        this.read = notification.getRead();
    }
}
