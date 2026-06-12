package com.swims.dto;

import lombok.Data;

@Data
public class DeviceHistoryRecordDto {
    private String createTime;
    private String status;
    private String operation;
    private String terminal;
}
