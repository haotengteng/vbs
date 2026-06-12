package com.swims.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alarm")
public class Alarm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alarm_type", length = 50)
    private String alarmType;

    @Column(name = "alarm_level", length = 20)
    private String alarmLevel;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Column(name = "target_type", length = 20, nullable = false)
    private String targetType;

    @Column(name = "target_name", length = 100)
    private String targetName;

    @Column(name = "pool_id", length = 100)
    private String poolId;

    @Column(name = "pool_name", length = 100)
    private String poolName;

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "status", length = 20)
    private String status;

    @CreationTimestamp
    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;
}
