package com.smartvision.back.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "GUARDIANS")
public class Guardian {

    @Id
    @Column(name = "GUARDIAN_ID", length = 36)
    private String guardianId;

    @Column(name = "EMAIL", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "PASSWORD_HASH", length = 100, nullable = false)
    private String passwordHash;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;
}
