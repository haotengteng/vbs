package com.swims.dto;

import lombok.Data;

@Data
public class SensorDto {
    private String id;
    private String name;
    private Double value;
    private String unit;
    private Double min;
    private Double max;
}
