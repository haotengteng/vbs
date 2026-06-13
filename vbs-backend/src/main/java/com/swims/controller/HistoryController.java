package com.swims.controller;

import com.swims.dto.ApiResponse;
import com.swims.dto.DataPointDto;
import com.swims.dto.DeviceHistoryRecordDto;
import com.swims.service.HistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/history")
@RequiredArgsConstructor
public class HistoryController {

    private final HistoryService historyService;

    @GetMapping("/sensor/{sensorId}")
    public ApiResponse<List<DataPointDto>> getSensorHistory(
            @PathVariable String sensorId,
            @RequestParam(defaultValue = "180") int minutes,
            @RequestParam(defaultValue = "5") int interval,
            @RequestParam(required = false) LocalDateTime startTime,
            @RequestParam(required = false) LocalDateTime endTime) {
        return ApiResponse.success(historyService.getSensorHistory(sensorId, minutes, interval, startTime, endTime));
    }

    @GetMapping("/device/{deviceId}")
    public ApiResponse<List<DeviceHistoryRecordDto>> getDeviceHistory(
            @PathVariable String deviceId,
            @RequestParam(defaultValue = "24") int hours) {
        return ApiResponse.success(historyService.getDeviceHistory(deviceId, hours));
    }
}
