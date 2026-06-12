package com.swims.service;

import com.swims.dto.ApiResponse;
import com.swims.dto.DeviceCommandRequest;
import com.swims.dto.DeviceCommandResponse;
import com.swims.dto.DeviceDto;
import com.swims.dto.PageResult;
import com.swims.entity.Device;
import com.swims.entity.DeviceRecord;
import com.swims.exception.BusinessException;
import com.swims.exception.ErrorCode;
import com.swims.repository.DeviceRecordRepository;
import com.swims.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceRecordRepository deviceRecordRepository;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public PageResult<DeviceDto> getDevices(String poolId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<Device> devicePage;

        if (poolId != null && status != null) {
            // TODO: 不确定性：前端poolId是frontendId (pool-1)，需转换为DB pool_id (P-001)
            String dbPoolId = frontendPoolIdToDbPoolId(poolId);
            devicePage = deviceRepository.findByPoolIdAndStatus(dbPoolId, status, pageable);
        } else if (poolId != null) {
            String dbPoolId = frontendPoolIdToDbPoolId(poolId);
            devicePage = deviceRepository.findByPoolId(dbPoolId, pageable);
        } else if (status != null) {
            devicePage = deviceRepository.findByStatus(status, pageable);
        } else {
            devicePage = deviceRepository.findAll(pageable);
        }

        List<DeviceDto> list = devicePage.getContent().stream()
                .map(this::convertToDto)
                .toList();

        return new PageResult<>(devicePage.getTotalElements(), page, size, list);
    }

    public DeviceDto getDeviceById(String deviceId) {
        Device device = deviceRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return convertToDto(device);
    }

    @Transactional
    public DeviceCommandResponse sendCommand(DeviceCommandRequest request) {
        Device device = deviceRepository.findByDeviceId(request.getDeviceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        DeviceRecord record = new DeviceRecord();
        record.setDeviceId(device.getDeviceId());
        record.setDeviceName(device.getDeviceName());
        record.setOperation(request.getOperation());
        record.setResult("已发送");
        record.setOperator(username);
        record.setTerminal("web");
        deviceRecordRepository.save(record);

        DeviceCommandResponse response = new DeviceCommandResponse();
        response.setId(record.getId());
        response.setDeviceId(device.getDeviceId());
        response.setDeviceName(device.getDeviceName());
        response.setOperation(request.getOperation());
        response.setResult("pending");
        response.setOperator(username);
        if (record.getCreateTime() != null) {
            response.setCreateTime(record.getCreateTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER));
        }
        return response;
    }

    private DeviceDto convertToDto(Device device) {
        DeviceDto dto = new DeviceDto();
        dto.setId(device.getDeviceId());
        dto.setName(device.getDeviceName());
        // TODO: 不确定性：device_type映射
        dto.setType(device.getDeviceType());
        dto.setStatus(device.getStatus());
        if (device.getStatusTime() != null) {
            dto.setStatusTime(device.getStatusTime().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER));
        }
        return dto;
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
