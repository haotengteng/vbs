package com.swims.dto;

import lombok.Data;

@Data
public class DeviceCommandResponse {
    private Long id;
    private String deviceId;
    private String deviceName;
    private String operation;
    private String result;
    private String operator;
    private String createTime;
}
