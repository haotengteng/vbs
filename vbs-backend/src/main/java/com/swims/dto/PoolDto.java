package com.swims.dto;

import lombok.Data;

import java.util.List;

@Data
public class PoolDto {
    private String id;
    private String code;
    private String name;
    private Double capacity;
    private Double maxLevel;
    private Double currentLevel;
    private Double flowRate;
    private String status;
    private List<DeviceDto> devices;
    private List<SensorDto> sensors;
}
