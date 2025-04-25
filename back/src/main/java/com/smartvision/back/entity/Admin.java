package com.studymate.back.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "ADMINS")
public class Admin {

    @Id
    @Column(name = "ADMIN_ID", length = 36)
    private String adminId;

    @Column(name = "PASSWORD_HASH", length = 100, nullable = false)
    private String passwordHash;

    @Column(name = "SECOND_PW", length = 10, nullable = false)
    private String secondPw = "0000";
}
