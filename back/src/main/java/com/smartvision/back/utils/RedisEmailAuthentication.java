package com.smartvision.back.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * 이메일 인증 Redis 관리 유틸리티
 */
@Component
public class RedisEmailAuthentication {

    private static final String PREFIX = "emailAuth:"; // redis 키 prefix

    private final StringRedisTemplate redisTemplate;

    @Autowired
    public RedisEmailAuthentication(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String buildKey(String email) {
        return PREFIX + email.toLowerCase();
    }

    /**
     * 이메일 인증 상태 조회 (Y or N)
     */
    public String checkEmailAuthentication(String email) {
        HashOperations<String, String, String> hashOperations = redisTemplate.opsForHash();
        return hashOperations.get(buildKey(email), "auth");
    }

    /**
     * 이메일 인증 코드 조회
     */
    public String getEmailAuthenticationCode(String email) {
        HashOperations<String, String, String> hashOperations = redisTemplate.opsForHash();
        return hashOperations.get(buildKey(email), "code");
    }

    /**
     * 이메일 인증 정보 저장 (인증코드 + 인증상태 초기화) + TTL 설정
     */
    public void setEmailAuthenticationExpire(String email, String code, long minutes) {
        String key = buildKey(email);
        HashOperations<String, String, String> hashOperations = redisTemplate.opsForHash();
        hashOperations.put(key, "code", code);
        hashOperations.put(key, "auth", "N"); // 아직 인증 안됐음
        redisTemplate.expire(key, Duration.ofMinutes(minutes)); // TTL 설정
    }

    /**
     * 이메일 인증 완료 처리 (auth -> Y)
     */
    public void setEmailAuthenticationComplete(String email) {
        HashOperations<String, String, String> hashOperations = redisTemplate.opsForHash();
        hashOperations.put(buildKey(email), "auth", "Y");
    }

    /**
     * 이메일 인증 관련 데이터 삭제
     */
    public void deleteEmailAuthenticationHistory(String email) {
        redisTemplate.delete(buildKey(email));
    }
}