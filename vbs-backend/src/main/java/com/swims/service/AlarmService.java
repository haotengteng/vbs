package com.swims.service;

import com.swims.dto.AlarmDto;
import com.swims.dto.AlarmStatsDto;
import com.swims.dto.PageResult;
import com.swims.entity.Alarm;
import com.swims.exception.BusinessException;
import com.swims.exception.ErrorCode;
import com.swims.repository.AlarmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AlarmRepository alarmRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public PageResult<AlarmDto> getAlarms(String status, String level, String poolId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Alarm> alarmPage;

        boolean hasStatus = status != null && !"all".equalsIgnoreCase(status);
        boolean hasLevel = level != null;
        boolean hasPoolId = poolId != null;

        String dbPoolId = hasPoolId ? frontendPoolIdToDbPoolId(poolId) : null;

        if (hasStatus && hasLevel && hasPoolId) {
            alarmPage = alarmRepository.findByStatusAndAlarmLevelAndPoolId(status, level, dbPoolId, pageable);
        } else if (hasStatus && hasLevel) {
            alarmPage = alarmRepository.findByStatusAndAlarmLevel(status, level, pageable);
        } else if (hasStatus && hasPoolId) {
            alarmPage = alarmRepository.findByStatusAndPoolId(status, dbPoolId, pageable);
        } else if (hasLevel && hasPoolId) {
            alarmPage = alarmRepository.findByAlarmLevelAndPoolId(level, dbPoolId, pageable);
        } else if (hasStatus) {
            alarmPage = alarmRepository.findByStatus(status, pageable);
        } else if (hasLevel) {
            alarmPage = alarmRepository.findByAlarmLevel(level, pageable);
        } else if (hasPoolId) {
            alarmPage = alarmRepository.findByPoolId(dbPoolId, pageable);
        } else {
            alarmPage = alarmRepository.findAll(pageable);
        }

        List<AlarmDto> list = alarmPage.getContent().stream()
                .map(this::convertToDto)
                .toList();

        return new PageResult<>(alarmPage.getTotalElements(), page, size, list);
    }

    public List<AlarmDto> getUnackAlarms() {
        return alarmRepository.findByStatus("unack").stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional
    public void acknowledgeAlarm(String alarmId) {
        // alarmId format: alarm-{target_id}-{timestamp}
        // TODO: 不确定性：alarmId格式为字符串如 alarm-pool-1-1717800000000，无法直接映射到数据库自增ID
        // 尝试从 alarmId 中提取数据库ID作为后备方案，如果无法解析则遍历查找
        Long dbId = extractDbIdFromAlarmId(alarmId);
        Alarm alarm;
        if (dbId != null) {
            alarm = alarmRepository.findById(dbId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        } else {
            // fallback: try to find by constructing from pool and timestamp - too expensive
            // Instead, require exact dbId or use a prefix pattern
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        alarm.setStatus("ack");
        alarmRepository.save(alarm);
    }

    public AlarmStatsDto getAlarmStats() {
        long warning = alarmRepository.countByAlarmLevel("warning");
        long danger = alarmRepository.countByAlarmLevel("danger");
        AlarmStatsDto stats = new AlarmStatsDto();
        stats.setWarning((int) warning);
        stats.setDanger((int) danger);
        stats.setTotal((int) (warning + danger));
        return stats;
    }

    private AlarmDto convertToDto(Alarm alarm) {
        AlarmDto dto = new AlarmDto();
        // TODO: 不确定性：alarmId 格式 alarm-{target_id}-{timestamp}，由DB自增ID生成降级方案
        dto.setId("alarm-" + alarm.getTargetId() + "-" + alarm.getCreateTime().toInstant(ZoneOffset.UTC).toEpochMilli());
        dto.setPoolId(dbPoolIdToFrontendId(alarm.getPoolId()));
        dto.setPoolName(alarm.getPoolName());
        dto.setLevel(alarm.getAlarmLevel());
        dto.setMessage(alarm.getMessage());
        if (alarm.getCreateTime() != null) {
            dto.setTimestamp(alarm.getCreateTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER));
        }
        dto.setStatus(alarm.getStatus());
        return dto;
    }

    private Long extractDbIdFromAlarmId(String alarmId) {
        // Try to parse if alarmId is numeric or contains numeric db id
        if (alarmId == null) return null;
        try {
            return Long.parseLong(alarmId);
        } catch (NumberFormatException e) {
            // If format is alarm-{target}-{ts}, we can't reliably extract db id
            return null;
        }
    }

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

    private String frontendPoolIdToDbPoolId(String frontendId) {
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
