package com.swims.controller;

import com.swims.dto.ApiResponse;
import com.swims.dto.DashboardStatsDto;
import com.swims.dto.MonitorItemDto;
import com.swims.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ApiResponse<DashboardStatsDto> getStats() {
        return ApiResponse.success(dashboardService.getStats());
    }

    @GetMapping("/monitor")
    public ApiResponse<List<MonitorItemDto>> getMonitor() {
        return ApiResponse.success(dashboardService.getMonitorItems());
    }
}
