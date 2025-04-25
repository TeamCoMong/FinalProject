package com.studymate.back.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DirectionRequest {
    private double originLat;
    private double originLng;
    private String destinationName;

    // 목적지의 위도/경도는 나중에 서비스에서 채움
    private double destLat;
    private double destLng;


    // 👉 여기에 생성자 추가
    public DirectionRequest(double originLat, double originLng, String destinationName) {
        this.originLat = originLat;
        this.originLng = originLng;
        this.destinationName = destinationName;
    }

}