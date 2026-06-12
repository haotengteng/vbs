package com.swims.controller;

import com.swims.dto.AlarmDto;
import com.swims.dto.AlarmStatsDto;
import com.swims.dto.ApiResponse;
import com.swims.dto.PageResult;
import com.swims.service.AlarmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping
    public ApiResponse<PageResult<AlarmDto>> getAlarms(
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String poolId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(alarmService.getAlarms(status, level, poolId, page, size));
    }

    @GetMapping("/unack")
    public ApiResponse<List<AlarmDto>> getUnackAlarms() {
        return ApiResponse.success(alarmService.getUnackAlarms());
    }

    @PutMapping("/{alarmId}/ack")
    public ApiResponse<Void> acknowledgeAlarm(@PathVariable String alarmId) {
        alarmService.acknowledgeAlarm(alarmId);
        return ApiResponse.success();
    }

    @GetMapping("/stats")
    public ApiResponse<AlarmStatsDto> getAlarmStats() {
        return ApiResponse.success(alarmService.getAlarmStats());
    }
}
