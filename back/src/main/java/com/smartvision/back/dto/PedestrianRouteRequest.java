package com.smartvision.back.dto;

public class PedestrianRouteRequest {
    private double startX;
    private double startY;
    private double endX;
    private double endY;
    private String startName;
    private String endName;

    private String reqCoordType = "WGS84GEO";
    private String resCoordType = "WGS84GEO";
    private String startAngle = "0";
    private String searchOption = "0";
    private String trafficInfo = "Y";

    // getter/setter 모두 추가

    public double getStartX() { return startX; }
    public void setStartX(double startX) { this.startX = startX; }
    public double getStartY() { return startY; }
    public void setStartY(double startY) { this.startY = startY; }
    public double getEndX() { return endX; }
    public void setEndX(double endX) { this.endX = endX; }
    public double getEndY() { return endY; }
    public void setEndY(double endY) { this.endY = endY; }
    public String getStartName() { return startName; }
    public void setStartName(String startName) { this.startName = startName; }
    public String getEndName() { return endName; }
    public void setEndName(String endName) { this.endName = endName; }

    public String getReqCoordType() { return reqCoordType; }
    public void setReqCoordType(String reqCoordType) { this.reqCoordType = reqCoordType; }
    public String getResCoordType() { return resCoordType; }
    public void setResCoordType(String resCoordType) { this.resCoordType = resCoordType; }
    public String getStartAngle() { return startAngle; }
    public void setStartAngle(String startAngle) { this.startAngle = startAngle; }
    public String getSearchOption() { return searchOption; }
    public void setSearchOption(String searchOption) { this.searchOption = searchOption; }
    public String getTrafficInfo() { return trafficInfo; }
    public void setTrafficInfo(String trafficInfo) { this.trafficInfo = trafficInfo; }
}
