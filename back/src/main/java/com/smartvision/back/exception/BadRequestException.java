package com.smartvision.back.exception;

import lombok.Getter;

/**
 * 400 BAD_REQUEST를 처리할 커스텀 예외
 */
@Getter
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
