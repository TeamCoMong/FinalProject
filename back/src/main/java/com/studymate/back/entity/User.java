package com.studymate.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 수정된 User Entity 클래스
 * USERS 테이블과 매핑되는 JPA Entity
 */
@Entity
@Table(name = "USERS") // 대문자 테이블명 명시적 지정
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /**
     * 사용자 ID (VARCHAR2(20) PRIMARY KEY)
     */
    @Id
    @Column(name = "USER_ID", length = 20, nullable = false)
    private String userId;

    /**
     * 암호화된 비밀번호 (VARCHAR2(100) NOT NULL)
     */
    @Column(name = "PASSWORD", length = 100, nullable = false)
    private String password;

    /**
     * 이름 (VARCHAR2(50) NOT NULL)
     */
    @Column(name = "NAME", length = 50, nullable = false)
    private String name;

    /**
     * 전화번호 (VARCHAR2(20) NOT NULL, UNIQUE)
     */
    @Column(name = "PHONE", length = 20, nullable = false, unique = true)
    private String phone;

    /**
     * 사용자 유형 (DISABLED/GUARDIAN) (VARCHAR2(10) NOT NULL)
     */
    @Column(name = "USER_TYPE", length = 10, nullable = false)
    private String userType;

    /**
     * 등록일자 (DATE DEFAULT SYSDATE NOT NULL)
     */
    @Column(name = "REG_DATE", nullable = false, updatable = false)
    private LocalDateTime regDate;

    /**
     * 마지막 로그인 일시 (DATE)
     */
    @Column(name = "LAST_LOGIN")
    private LocalDateTime lastLogin;

    /**
     * 계정 상태 (ACTIVE/INACTIVE/SUSPENDED) (VARCHAR2(10) DEFAULT 'ACTIVE' NOT NULL)
     */
    @Column(name = "STATUS", length = 10, nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    /**
     * Entity 저장 전 실행
     */
    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now();
        this.status = "ACTIVE"; // 기본값 설정
    }

    /**
     * 로그인 성공 시 lastLogin 업데이트 메서드
     */
    public void updateLastLogin() {
        this.lastLogin = LocalDateTime.now();
    }

    // Enum 타입으로 관리할 경우 (선택사항)
    public enum UserType {
        DISABLED, GUARDIAN
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }
}