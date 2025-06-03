package com.smartvision.back.Location;

import java.util.List;
import java.util.Map;

public class LocationMessage {
    private String type;  // e.g., "LOCATION", "ROUTE"
    private String sender; // "user" or "guardian"
    private double latitude;
    private double longitude;
    private List<Map<String, Double>> path; // 경로 정보

    // getters, setters
}