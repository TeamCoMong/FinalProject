package com.smartvision.back.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "guardian_user_relation")
public class GuardianUserRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "relation_id")
    private Long relationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id", nullable = false)
    private Guardian guardian;  // 연결된 보호자

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;          // 연결된 사용자

    @Column(name = "relation_type", length = 30, nullable = false)
    private String relationType;  // 관계 유형 (예: 보호자, 가족 등)

    @Column(name = "reg_date", nullable = false)
    private java.time.LocalDateTime regDate;  // 등록일시

    @Column(name = "is_primary_guardian", nullable = false, length = 1)
    private String isPrimaryGuardian;  // 주 보호자인지 여부 ('Y' 또는 'N')
}
