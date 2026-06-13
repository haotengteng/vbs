package com.swims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonitorItemDto {
    private String label;
    private String value;
    private String unit;
    private String status;
    private String type;
}
