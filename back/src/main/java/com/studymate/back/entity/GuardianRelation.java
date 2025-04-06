package com.studymate.back.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "GUARDIAN_RELATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuardianRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RELATION_ID")
    private Long relationId;

    @ManyToOne
    @JoinColumn(name = "GUARDIAN_ID", nullable = false)
    private User guardian;

    @ManyToOne
    @JoinColumn(name = "DISABLED_ID", nullable = false)
    private User disabled;

    @Column(name = "RELATION_TYPE", nullable = false, length = 30)
    private String relationType;

    @Column(name = "IS_PRIMARY_GUARDIAN", length = 1)
    private String isPrimaryGuardian; // "Y" or "N"

    @Column(name = "REG_DATE", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now();
        if (this.isPrimaryGuardian == null) this.isPrimaryGuardian = "N";
    }
}
