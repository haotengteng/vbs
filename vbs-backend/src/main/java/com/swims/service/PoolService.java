package com.swims.service;

import com.swims.dto.DeviceDto;
import com.swims.dto.PoolDto;
import com.swims.dto.SensorDto;
import com.swims.entity.Device;
import com.swims.entity.Pool;
import com.swims.entity.Sensor;
import com.swims.entity.SensorRecord;
import com.swims.exception.BusinessException;
import com.swims.exception.ErrorCode;
import com.swims.repository.DeviceRepository;
import com.swims.repository.PoolRepository;
import com.swims.repository.SensorRecordRepository;
import com.swims.repository.SensorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PoolService {

    private final PoolRepository poolRepository;
    private final DeviceRepository deviceRepository;
    private final SensorRepository sensorRepository;
    private final SensorRecordRepository sensorRecordRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public List<PoolDto> getAllPools() {
        return poolRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    public PoolDto getPoolById(String poolId) {
        // poolId here is frontend id like "pool-1"
        String dbPoolId = frontendIdToDbPoolId(poolId);
        Pool pool = poolRepository.findByPoolId(dbPoolId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return convertToDto(pool);
    }

    @Transactional(readOnly = true)
    protected PoolDto convertToDto(Pool pool) {
        PoolDto dto = new PoolDto();
        // TODO: 不确定性：pool_id (P-001) 到前端 id (pool-1) 的映射规则需确认
        dto.setId(dbPoolIdToFrontendId(pool.getPoolId()));
        dto.setCode(pool.getPoolId());
        dto.setName(pool.getPoolName());
        dto.setCapacity(pool.getCapacity());
        dto.setMaxLevel(pool.getMaxLevel());

        List<Sensor> sensors = sensorRepository.findByPoolId(pool.getPoolId());
        List<Device> devices = deviceRepository.findByPoolId(pool.getPoolId());

        // currentLevel: from level sensor latest record
        double currentLevel = 0.0;
        Optional<Sensor> levelSensor = sensors.stream()
                .filter(s -> "level".equalsIgnoreCase(s.getSensorType()))
                .findFirst();
        if (levelSensor.isPresent()) {
            Optional<SensorRecord> record = sensorRecordRepository.findLatestBySensorId(levelSensor.get().getSensorId());
            if (record.isPresent() && record.get().getValue() != null) {
                currentLevel = record.get().getValue();
            }
        }
        dto.setCurrentLevel(currentLevel);

        // flowRate: from flow sensor latest record
        double flowRate = 0.0;
        Optional<Sensor> flowSensor = sensors.stream()
                .filter(s -> "flow".equalsIgnoreCase(s.getSensorType()))
                .findFirst();
        if (flowSensor.isPresent()) {
            Optional<SensorRecord> record = sensorRecordRepository.findLatestBySensorId(flowSensor.get().getSensorId());
            if (record.isPresent() && record.get().getValue() != null) {
                flowRate = record.get().getValue();
            }
        }
        dto.setFlowRate(flowRate);

        // status mapping: DB [normal,overflow,low,high] -> API [normal,warning,danger]
        // TODO: 不确定性：映射规则需确认
        String dbStatus = pool.getStatus();
        if ("overflow".equalsIgnoreCase(dbStatus)) {
            dto.setStatus("danger");
        } else if ("low".equalsIgnoreCase(dbStatus) || "high".equalsIgnoreCase(dbStatus)) {
            dto.setStatus("warning");
        } else {
            dto.setStatus("normal");
        }

        dto.setDevices(devices.stream().map(this::convertDevice).toList());
        dto.setSensors(sensors.stream().map(this::convertSensor).toList());

        return dto;
    }

    private DeviceDto convertDevice(Device device) {
        DeviceDto dto = new DeviceDto();
        dto.setId(device.getDeviceId());
        dto.setName(device.getDeviceName());
        // TODO: 不确定性：device_type DB枚举[pump,fan,valve,doser]与API枚举差异大，当前直接透传
        dto.setType(device.getDeviceType());
        dto.setStatus(device.getStatus());
        if (device.getStatusTime() != null) {
            dto.setStatusTime(device.getStatusTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER));
        }
        return dto;
    }

    private SensorDto convertSensor(Sensor sensor) {
        SensorDto dto = new SensorDto();
        dto.setId(sensor.getSensorId());
        dto.setName(sensor.getSensorName());
        dto.setUnit(sensor.getUnit());
        dto.setMin(sensor.getMinValue());
        dto.setMax(sensor.getMaxValue());

        Optional<SensorRecord> record = sensorRecordRepository.findLatestBySensorId(sensor.getSensorId());
        dto.setValue(record.map(SensorRecord::getValue).orElse(0.0));

        return dto;
    }

    // Mapping: P-001 -> pool-1, P-009 -> pool-9
    // TODO: 不确定性：此映射规则基于mock数据推断，需确认
    private String dbPoolIdToFrontendId(String dbPoolId) {
        if (dbPoolId == null) return null;
        String numPart = dbPoolId.replaceAll("[^0-9]", "");
        try {
            int num = Integer.parseInt(numPart);
            return "pool-" + num;
        } catch (NumberFormatException e) {
            return dbPoolId;
        }
    }

    // Mapping: pool-1 -> P-001 (reverse mapping for lookup)
    // TODO: 不确定性：反向映射规则需确认，当前假设格式固定为 P-00N
    private String frontendIdToDbPoolId(String frontendId) {
        if (frontendId == null) return null;
        String numPart = frontendId.replaceAll("[^0-9]", "");
        try {
            int num = Integer.parseInt(numPart);
            return String.format("P-%03d", num);
        } catch (NumberFormatException e) {
            return frontendId;
        }
    }
}
