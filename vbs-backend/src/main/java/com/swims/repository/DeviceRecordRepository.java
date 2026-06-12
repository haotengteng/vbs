package com.swims.repository;

import com.swims.entity.DeviceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeviceRecordRepository extends JpaRepository<DeviceRecord, Long> {

    List<DeviceRecord> findByDeviceIdAndCreateTimeGreaterThanEqualOrderByCreateTimeAsc(
            String deviceId, LocalDateTime startTime);

    @Query(value = """
        SELECT * FROM device_record 
        WHERE device_id = :deviceId 
        AND create_time >= :startTime 
        ORDER BY create_time ASC
        """, nativeQuery = true)
    List<DeviceRecord> findHistoryByDeviceIdAndTimeRange(
            @Param("deviceId") String deviceId,
            @Param("startTime") LocalDateTime startTime);
}
