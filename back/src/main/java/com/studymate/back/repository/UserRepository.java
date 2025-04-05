package com.studymate.back.repository;

import com.studymate.back.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * JPA를 활용한 사용자 정보 접근 Layer
 * USERS 테이블에 맞게 수정된 버전
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> { // ID 타입을 String으로 변경

    /**
     * 사용자 ID로 조회 (기본 제공 메서드)
     * Optional<User> findById(String userId);
     */

    /**
     * 전화번호로 사용자 조회 -> 로그인/아이디 찾기 시 사용
     * @param phone 전화번호
     * @return Optional<User>
     */
    Optional<User> findByPhone(String phone);

    /**
     * 사용자 유형으로 조회 -> 시각장애인 또는 보호자 목록 조회 시 사용
     * @param userType 사용자 유형 (DISABLED/GUARDIAN)
     * @return Optional<User>
     */
    Optional<User> findByUserType(String userType);

    /**
     * 전화번호 존재 여부 확인 -> 회원가입 시 중복 검사
     * @param phone 전화번호
     * @return true: 존재, false: 존재X
     */
    boolean existsByPhone(String phone);

    /**
     * 계정 상태로 사용자 조회 -> 휴면 계정 관리 시 사용
     * @param status 계정 상태 (ACTIVE/INACTIVE/SUSPENDED)
     * @return Optional<User>
     */
    Optional<User> findByStatus(String status);

    /**
     * 사용자 ID와 상태로 조회 -> 계정 활성화 여부 확인
     * @param userId 사용자 ID
     * @param status 계정 상태
     * @return Optional<User>
     */
    Optional<User> findByUserIdAndStatus(String userId, String status);
}