package com.smartvision.back.entity;

import groovyjarjarantlr4.v4.tool.ANTLRMessage;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "NOTIFICATIONS")
public class Notification {

    @Id
    @Column(name = "NOTIFICATION_ID", length = 36)
    private String notificationId;

    @ManyToOne
    @JoinColumn(name = "GUARDIAN_ID", nullable = false)
    private Guardian guardian;

    @ManyToOne
    @JoinColumn(name = "ERROR_ID", nullable = false)
    private ErrorLog errorLog;

    @Column(name = "SENT_AT")
    private LocalDateTime sentAt;


}
