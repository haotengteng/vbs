package com.swims.service;

import com.swims.dto.DataPointDto;
import com.swims.dto.DeviceHistoryRecordDto;
import com.swims.entity.DeviceRecord;
import com.swims.entity.SensorRecord;
import com.swims.repository.DeviceRecordRepository;
import com.swims.repository.SensorRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final SensorRecordRepository sensorRecordRepository;
    private final DeviceRecordRepository deviceRecordRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public List<DataPointDto> getSensorHistory(String sensorId, int hours, int intervalMinutes) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusHours(hours);

        List<DataPointDto> result = new ArrayList<>();

        // If interval is small (e.g., 1 minute) or data volume is manageable, use raw data
        // For larger intervals, use TimescaleDB time_bucket aggregation
        if (intervalMinutes <= 1) {
            List<SensorRecord> records = sensorRecordRepository.findBySensorIdAndTimeRange(sensorId, startTime, endTime);
            for (SensorRecord record : records) {
                result.add(new DataPointDto(
                        record.getTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER),
                        record.getValue()
                ));
            }
        } else {
            String bucketInterval = intervalMinutes + " minutes";
            List<Object[]> rows = sensorRecordRepository.findAggregatedBySensorIdAndTimeRange(
                    sensorId, startTime, endTime, bucketInterval);
            for (Object[] row : rows) {
                Timestamp bucket = (Timestamp) row[0];
                Double avg = row[1] instanceof Number ? ((Number) row[1]).doubleValue() : null;
                if (bucket != null && avg != null) {
                    result.add(new DataPointDto(
                            bucket.toLocalDateTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER),
                            avg
                    ));
                }
            }
        }

        return result;
    }

    public List<DeviceHistoryRecordDto> getDeviceHistory(String deviceId, int hours) {
        LocalDateTime startTime = LocalDateTime.now().minusHours(hours);
        List<DeviceRecord> records = deviceRecordRepository.findHistoryByDeviceIdAndTimeRange(deviceId, startTime);

        return records.stream().map(this::convertDeviceRecord).toList();
    }

    private DeviceHistoryRecordDto convertDeviceRecord(DeviceRecord record) {
        DeviceHistoryRecordDto dto = new DeviceHistoryRecordDto();
        if (record.getCreateTime() != null) {
            dto.setCreateTime(record.getCreateTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER));
        }
        // TODO: 不确定性：device_record表无status字段，仅有operation(start/stop)和result。
        // 以下为推断映射，实际业务逻辑需确认。
        String operation = record.getOperation();
        if ("start".equalsIgnoreCase(operation)) {
            dto.setStatus("running");
        } else if ("stop".equalsIgnoreCase(operation)) {
            dto.setStatus("stopped");
        } else {
            dto.setStatus("stopped"); // fallback
        }
        dto.setOperation(record.getOperator());
        dto.setTerminal(record.getTerminal());
        return dto;
    }
}
