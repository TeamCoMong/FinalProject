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
@Table(name = "ADMINS")
public class Admin {

    @Id
    @Column(name = "ADMIN_ID", length = 20, nullable = false)
    private String adminId;

    @Column(name = "PASSWORD", length = 100, nullable = false)
    private String password;

    @Column(name = "NAME", length = 50, nullable = false)
    private String name;

    @Column(name = "REG_DATE", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @Column(name = "LAST_LOGIN")
    private LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now();
    }

    public void updateLastLogin() {
        this.lastLogin = LocalDateTime.now();
    }
}