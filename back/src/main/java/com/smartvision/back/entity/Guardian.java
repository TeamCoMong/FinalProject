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

    @Column(name = "GUARDIAN_NAME", length = 100, nullable = false)
    private String guardianName;

    @Column(name = "EMAIL", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "PASSWORD_HASH", length = 100, nullable = false)
    private String passwordHash;

    @Column(name = "PHONE", length = 20)
    private String phone;
}
