package com.swims.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "pool")
public class Pool {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pool_id", length = 100, unique = true)
    private String poolId;

    @Column(name = "pool_name", length = 100, unique = true)
    private String poolName;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "capacity")
    private Double capacity;

    @Column(name = "maxLevel")
    private Double maxLevel;

    @CreationTimestamp
    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;
}
