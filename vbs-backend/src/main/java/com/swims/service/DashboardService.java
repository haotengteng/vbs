package com.swims.service;

import com.swims.dto.DashboardStatsDto;
import com.swims.dto.MonitorItemDto;
import com.swims.entity.Device;
import com.swims.entity.Pool;
import com.swims.entity.Sensor;
import com.swims.entity.SensorRecord;
import com.swims.repository.DeviceRepository;
import com.swims.repository.PoolRepository;
import com.swims.repository.SensorRecordRepository;
import com.swims.repository.SensorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PoolRepository poolRepository;
    private final DeviceRepository deviceRepository;
    private final SensorRepository sensorRepository;
    private final SensorRecordRepository sensorRecordRepository;


    public DashboardStatsDto getStats() {
        List<Pool> pools = poolRepository.findAll();
        long runningDevices = deviceRepository.countByStatus("running");
        long faultDevices = deviceRepository.countByStatus("fault");

        // deviceCategories: group devices by pool_name (only specific pools)
        List<String> targetPools = List.of("集水池", "缺氧池", "膜池", "污泥浓缩池");
        List<Device> allDevices = deviceRepository.findAll();
        Map<String, Long> categoryMap = allDevices.stream()
                .filter(d -> d.getPoolName() != null && targetPools.contains(d.getPoolName()))
                .collect(Collectors.groupingBy(
                        Device::getPoolName,
                        Collectors.counting()
                ));

        List<DashboardStatsDto.CategoryDto> categories = targetPools.stream()
                .map(name -> new DashboardStatsDto.CategoryDto(name, categoryMap.getOrDefault(name, 0L).intValue()))
                .collect(Collectors.toList());

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalPools(pools.size());
        stats.setRunningDevices((int) runningDevices);
        stats.setFaultDevices((int) faultDevices);
        stats.setDeviceCategories(categories);
        return stats;
    }

    public List<MonitorItemDto> getMonitorItems() {
        // TODO: 不确定性：MonitorItem 需从传感器实时数据组装，展示哪些传感器及icon映射规则需确认
        List<Sensor> sensors = sensorRepository.findAll();
        List<MonitorItemDto> items = new ArrayList<>();

        for (Sensor sensor : sensors) {
            Optional<SensorRecord> recordOpt = sensorRecordRepository.findLatestBySensorId(sensor.getSensorId());
            if (recordOpt.isEmpty()) continue;

            SensorRecord record = recordOpt.get();
            Double value = record.getValue();
            if (value == null) continue;

            String status = "normal";
            if (sensor.getMinValue() != null && sensor.getMaxValue() != null) {
                if (value < sensor.getMinValue() || value > sensor.getMaxValue()) {
                    status = "warning";
                }
                // danger threshold: 20% beyond range
                double range = sensor.getMaxValue() - sensor.getMinValue();
                if (range > 0) {
                    if (value < sensor.getMinValue() - range * 0.2 || value > sensor.getMaxValue() + range * 0.2) {
                        status = "danger";
                    }
                }
            }

            String label = sensor.getSensorName();
            final String labelForCheck = label;
            // If multiple pools have same sensor name, append pool name
            if (sensors.stream().filter(s -> labelForCheck.equals(s.getSensorName())).count() > 1) {
                label = sensor.getPoolName() + sensor.getSensorName();
            }

            items.add(new MonitorItemDto(
                    label,
                    String.format("%.2f", value),
                    sensor.getUnit() != null ? sensor.getUnit() : "",
                    status,
                    sensor.getSensorType()
            ));
        }

        return items;
    }
}
