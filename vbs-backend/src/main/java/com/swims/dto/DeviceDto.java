package com.swims.dto;

import lombok.Data;

@Data
public class DeviceDto {
    private String id;
    private String name;
    private String type;
    private String status;
    private String statusTime;
}
