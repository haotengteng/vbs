package com.swims.service;

import com.swims.dto.ApiResponse;
import com.swims.dto.MqttPublishRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MqttService {

    public ApiResponse<Void> publish(MqttPublishRequest request) {
        // TODO: 不确定性：MQTT客户端未集成，当前仅打印日志。生产环境需接入Paho或Spring Integration MQTT
        log.info("[MQTT Publish] topic={}, payload={}, qos={}", request.getTopic(), request.getPayload(), request.getQos());
        return ApiResponse.success();
    }
}
