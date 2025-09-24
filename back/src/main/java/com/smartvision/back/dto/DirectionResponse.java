package com.studymate.back.dto;

import lombok.Data;
import java.util.List;

@Data
public class DirectionResponse {
    private String responseJson;
    private List<List<Double>> path;
    private double distance; // km 단위
    private int duration;    // 분 단위
}