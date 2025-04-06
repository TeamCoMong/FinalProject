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
@Table(name = "USERS") // 대문자 테이블명 명시
public class User {

    @Id
    @Column(name = "USER_ID", length = 20, nullable = false)
    private String userId;  // 기존 username 대신 userId 사용

    @Column(name = "PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;

    @Column(name = "PHONE", length = 20, nullable = false, unique = true)
    private String phone;

    @Column(name = "USER_TYPE", length = 10, nullable = false)
    private String userType;  // DISABLED 또는 GUARDIAN

    @Column(name = "REG_DATE", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @Column(name = "LAST_LOGIN")
    private LocalDateTime lastLogin;

    @Column(name = "STATUS", length = 10, nullable = false)
    @Builder.Default
    private String status = "ACTIVE";  // ACTIVE, INACTIVE, SUSPENDED

    // 추가 메서드
    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public void updateLastLogin() {
        this.lastLogin = LocalDateTime.now();
    }

    // ENUM 정의 (선택사항)
    public enum UserType {
        DISABLED, GUARDIAN
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }
}