package com.swims.repository;

import com.swims.entity.Pool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PoolRepository extends JpaRepository<Pool, Long> {
    Optional<Pool> findByPoolId(String poolId);
}
