package com.swims.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Entity
@IdClass(SensorRecord.SensorRecordId.class)
@Table(name = "sensor_record")
public class SensorRecord {
    @Id
    @Column(name = "time", nullable = false)
    private LocalDateTime time;

    @Id
    @Column(name = "sensor_id", length = 100, nullable = false)
    private String sensorId;

    @Column(name = "value")
    private Double value;

    @Column(name = "status", length = 10, nullable = false)
    private String status;

    @Data
    public static class SensorRecordId implements Serializable {
        private LocalDateTime time;
        private String sensorId;
    }
}
