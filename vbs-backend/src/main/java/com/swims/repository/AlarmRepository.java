package com.swims.repository;

import com.swims.entity.Alarm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {

    Page<Alarm> findByStatus(String status, Pageable pageable);

    Page<Alarm> findByAlarmLevel(String alarmLevel, Pageable pageable);

    Page<Alarm> findByPoolId(String poolId, Pageable pageable);

    Page<Alarm> findByStatusAndAlarmLevel(String status, String alarmLevel, Pageable pageable);

    Page<Alarm> findByStatusAndPoolId(String status, String poolId, Pageable pageable);

    Page<Alarm> findByAlarmLevelAndPoolId(String alarmLevel, String poolId, Pageable pageable);

    Page<Alarm> findByStatusAndAlarmLevelAndPoolId(String status, String alarmLevel, String poolId, Pageable pageable);

    List<Alarm> findByStatus(String status);

    long countByAlarmLevel(String alarmLevel);

    long countByStatus(String status);
}
