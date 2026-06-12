package com.swims.service;

import com.swims.dto.ApiResponse;
import com.swims.dto.LoginRequest;
import com.swims.dto.LoginResponse;
import com.swims.entity.User;
import com.swims.exception.BusinessException;
import com.swims.exception.ErrorCode;
import com.swims.repository.UserRepository;
import com.swims.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ApiResponse<LoginResponse> login(LoginRequest request) {
        // 开发环境友好：若数据库中无用户，自动创建默认 admin
//        ensureDefaultAdminExists();

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login failed: user not found - {}", request.getUsername());
                    return new BusinessException(ErrorCode.UNAUTHORIZED);
                });

        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!matches) {
            log.warn("Login failed: password mismatch for user - {}", request.getUsername());
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtTokenProvider.generateToken(authentication.getName());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRealName(user.getUsername());
        response.setRole("admin");

        log.info("Login success: {}", request.getUsername());
        return ApiResponse.success(response);
    }

    public ApiResponse<Void> logout() {
        return ApiResponse.success();
    }

    public ApiResponse<LoginResponse> refresh(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        String username = jwtTokenProvider.getUsernameFromToken(token);
        String newToken = jwtTokenProvider.generateToken(username);

        LoginResponse response = new LoginResponse();
        response.setToken(newToken);
        response.setUsername(username);
        response.setRealName(username);
        response.setRole("admin");

        return ApiResponse.success(response);
    }

    /**
     * 开发环境兜底：若数据库中不存在 admin 用户，自动创建默认账号 admin/123456
     */
    private synchronized void ensureDefaultAdminExists() {
        try {
            if (userRepository.count() == 0) {
                log.info("No users found in database, creating default admin user (admin/123456)");
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("123456"));
                admin.setCreateTime(LocalDateTime.now());
                admin.setUpdateTime(LocalDateTime.now());
                userRepository.save(admin);
            }
        } catch (Exception e) {
            log.warn("Failed to create default admin user: {}", e.getMessage());
        }
    }
}
