package com.swims.controller;

import com.swims.dto.ApiResponse;
import com.swims.dto.MqttPublishRequest;
import com.swims.service.MqttService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mqtt")
@RequiredArgsConstructor
public class MqttController {

    private final MqttService mqttService;

    @PostMapping("/publish")
    public ApiResponse<Void> publish(@Valid @RequestBody MqttPublishRequest request) {
        return mqttService.publish(request);
    }
}
