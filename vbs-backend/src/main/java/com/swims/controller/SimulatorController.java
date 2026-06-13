package com.swims.controller;

import com.swims.dto.ApiResponse;
import com.swims.service.SensorDataSimulator;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/simulator")
@RequiredArgsConstructor
public class SimulatorController {

    private final SensorDataSimulator simulator;

    @PostMapping("/start")
    public ApiResponse<String> start() {
        simulator.start();
        return ApiResponse.success("Sensor data simulator started");
    }

    @PostMapping("/stop")
    public ApiResponse<String> stop() {
        simulator.stop();
        return ApiResponse.success("Sensor data simulator stopped");
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> status() {
        Map<String, Object> result = new HashMap<>();
        result.put("running", simulator.isRunning());
        return ApiResponse.success(result);
    }
}
