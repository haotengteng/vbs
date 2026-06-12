package com.swims.controller;

import com.swims.dto.ApiResponse;
import com.swims.dto.PoolDto;
import com.swims.service.PoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pools")
@RequiredArgsConstructor
public class PoolController {

    private final PoolService poolService;

    @GetMapping
    public ApiResponse<List<PoolDto>> getAllPools() {
        return ApiResponse.success(poolService.getAllPools());
    }

    @GetMapping("/{poolId}")
    public ApiResponse<PoolDto> getPoolById(@PathVariable String poolId) {
        return ApiResponse.success(poolService.getPoolById(poolId));
    }
}
