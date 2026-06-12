package com.swims.dto;

import lombok.Data;

@Data
public class AlarmDto {
    private String id;
    private String poolId;
    private String poolName;
    private String level;
    private String message;
    private String timestamp;
    private String status;
}
