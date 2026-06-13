package com.swims.service;

import com.swims.entity.Sensor;
import com.swims.entity.SensorRecord;
import com.swims.repository.SensorRecordRepository;
import com.swims.repository.SensorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@Slf4j
@RequiredArgsConstructor
public class SensorDataSimulator {

    private final SensorRepository sensorRepository;
    private final SensorRecordRepository sensorRecordRepository;

    private ScheduledExecutorService executor;
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final Map<String, Double> currentValues = new ConcurrentHashMap<>();

    /**
     * 启动模拟器
     */
    public synchronized void start() {
        if (running.get()) {
            log.warn("Sensor data simulator is already running");
            return;
        }

        initCurrentValues();

        executor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "sensor-simulator");
            t.setDaemon(true);
            return t;
        });

        // 每 5 秒生成一批数据
        executor.scheduleAtFixedRate(this::generateData, 0, 5, TimeUnit.SECONDS);
        running.set(true);
        log.info("Sensor data simulator started");
    }

    /**
     * 停止模拟器
     */
    public synchronized void stop() {
        if (!running.get()) {
            log.warn("Sensor data simulator is not running");
            return;
        }

        if (executor != null) {
            executor.shutdownNow();
            executor = null;
        }

        running.set(false);
        log.info("Sensor data simulator stopped");
    }

    /**
     * 是否正在运行
     */
    public boolean isRunning() {
        return running.get();
    }

    /**
     * 初始化每个传感器的当前值为量程中点附近
     */
    private void initCurrentValues() {
        List<Sensor> sensors = sensorRepository.findAll();
        for (Sensor sensor : sensors) {
            double min = sensor.getMinValue() != null ? sensor.getMinValue() : 0.0;
            double max = sensor.getMaxValue() != null ? sensor.getMaxValue() : 100.0;
            double initial = min + (max - min) * (0.4 + Math.random() * 0.2); // 40%~60% 之间
            currentValues.put(sensor.getSensorId(), initial);
        }
        log.info("Initialized {} sensor current values", currentValues.size());
    }

    /**
     * 生成模拟数据并写入 sensor_record
     */
    private void generateData() {
        List<Sensor> sensors = sensorRepository.findAll();
        if (sensors.isEmpty()) {
            log.warn("No sensors found, skipping data generation");
            return;
        }

        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);

        for (Sensor sensor : sensors) {
            try {
                double min = sensor.getMinValue() != null ? sensor.getMinValue() : 0.0;
                double max = sensor.getMaxValue() != null ? sensor.getMaxValue() : 100.0;
                double range = max - min;
                double current = currentValues.getOrDefault(sensor.getSensorId(), min + range * 0.5);

                // 随机游走：变化幅度为量程的 ±2%
                double step = range * 0.02;
                double change = (Math.random() * 2 - 1) * step;
                current += change;

                // 软边界约束：超出范围时向中心拉回
                if (current < min) {
                    current = min + Math.random() * step;
                }
                if (current > max) {
                    current = max - Math.random() * step;
                }

                // 偶尔生成异常值（5% 概率，用于测试告警场景）
                if (Math.random() < 0.05) {
                    current = max + range * 0.05 * (1 + Math.random());
                }

                currentValues.put(sensor.getSensorId(), current);

                // 状态判断
                String status = (current < min || current > max) ? "warning" : "normal";

                SensorRecord record = new SensorRecord();
                record.setTime(now);
                record.setSensorId(sensor.getSensorId());
                record.setValue(Math.round(current * 100.0) / 100.0);
                record.setStatus(status);

                sensorRecordRepository.save(record);
            } catch (Exception e) {
                log.error("Failed to generate data for sensor {}: {}", sensor.getSensorId(), e.getMessage());
            }
        }
    }

}
