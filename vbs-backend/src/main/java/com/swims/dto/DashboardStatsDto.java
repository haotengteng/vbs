package com.swims.dto;

import lombok.Data;

import java.util.List;

@Data
public class DashboardStatsDto {
    private int totalPools;
    private int runningDevices;
    private int faultDevices;
    private List<CategoryDto> deviceCategories;

    @Data
    public static class CategoryDto {
        private String name;
        private int value;

        public CategoryDto(String name, int value) {
            this.name = name;
            this.value = value;
        }
    }
}
