package com.studymate.back.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ERROR_LOG")
public class ErrorLog {

    @Id
    @Column(name = "ERROR_ID", length = 36)
    private String errorId;

    @ManyToOne
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "ERROR_TYPE", length = 100, nullable = false)
    private String errorType;

    @Column(name = "ERROR_CONTEXT", length = 100)
    private String errorContext;

    @Column(name = "TIMESTAMP")
    private LocalDateTime timestamp;

    @Column(name = "RESOLVED", length = 1)
    private String resolved = "N";

    @PrePersist
    public void onCreate() {
        this.timestamp = LocalDateTime.now();
        if (resolved == null) {
            resolved = "N";
        }
    }
}
