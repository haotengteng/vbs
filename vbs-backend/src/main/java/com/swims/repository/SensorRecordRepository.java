package com.swims.repository;

import com.swims.entity.SensorRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorRecordRepository extends JpaRepository<SensorRecord, SensorRecord.SensorRecordId> {

    @Query(value = """
        SELECT * FROM sensor_record 
        WHERE sensor_id = :sensorId 
        ORDER BY time DESC 
        LIMIT 1
        """, nativeQuery = true)
    Optional<SensorRecord> findLatestBySensorId(@Param("sensorId") String sensorId);

    @Query(value = """
        SELECT * FROM sensor_record 
        WHERE sensor_id = :sensorId 
        AND time >= :startTime 
        AND time <= :endTime 
        ORDER BY time ASC
        """, nativeQuery = true)
    List<SensorRecord> findBySensorIdAndTimeRange(
            @Param("sensorId") String sensorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query(value = """
        SELECT time_bucket(CAST(:bucketInterval AS interval), time) AS bucket, 
               AVG(value) AS avg_value,
               MAX(value) AS max_value,
               MIN(value) AS min_value
        FROM sensor_record 
        WHERE sensor_id = :sensorId 
        AND time >= :startTime 
        AND time <= :endTime 
        GROUP BY bucket 
        ORDER BY bucket ASC
        """, nativeQuery = true)
    List<Object[]> findAggregatedBySensorIdAndTimeRange(
            @Param("sensorId") String sensorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("bucketInterval") String bucketInterval);
}
