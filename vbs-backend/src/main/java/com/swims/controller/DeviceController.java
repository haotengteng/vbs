package com.swims.controller;

import com.swims.dto.*;
import com.swims.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ApiResponse<PageResult<DeviceDto>> getDevices(
            @RequestParam(required = false) String poolId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(deviceService.getDevices(poolId, status, page, size));
    }

    @GetMapping("/{deviceId}")
    public ApiResponse<DeviceDto> getDeviceById(@PathVariable String deviceId) {
        return ApiResponse.success(deviceService.getDeviceById(deviceId));
    }

    @PostMapping("/command")
    public ApiResponse<DeviceCommandResponse> sendCommand(@Valid @RequestBody DeviceCommandRequest request) {
        return ApiResponse.success(deviceService.sendCommand(request));
    }
}
