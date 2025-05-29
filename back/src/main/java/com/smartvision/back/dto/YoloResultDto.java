// YoloResultDto.java
package com.smartvision.back.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class YoloResultDto {
    private String deviceId;
    private String timestamp;
    private List<Detection> detections;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Detection {
        private String label;
        private double confidence;
    }
}
