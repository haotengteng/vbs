package com.swims.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MqttPublishRequest {
    @NotBlank(message = "主题不能为空")
    private String topic;

    @NotBlank(message = "消息内容不能为空")
    private String payload;

    private int qos = 1;
}
