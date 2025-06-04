package com.smartvision.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "USERS")
public class User {

    @Id
    @Column(name = "USER_ID", length = 36, nullable = false)
    private String userId;

    @Column(name = "NAME", length = 100, nullable = false)
    private String name;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public String getUsername() {
        return "";
    }

    public String getPassword() {
        return "";
    }
}
