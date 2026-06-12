package com.swims.repository;

import com.swims.entity.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    Optional<Device> findByDeviceId(String deviceId);

    List<Device> findByPoolId(String poolId);

    Page<Device> findByPoolId(String poolId, Pageable pageable);

    Page<Device> findByStatus(String status, Pageable pageable);

    Page<Device> findByPoolIdAndStatus(String poolId, String status, Pageable pageable);

    long countByStatus(String status);
}
