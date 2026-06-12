package com.swims.dto;

import lombok.Data;

@Data
public class AlarmStatsDto {
    private int warning;
    private int danger;
    private int total;
}
