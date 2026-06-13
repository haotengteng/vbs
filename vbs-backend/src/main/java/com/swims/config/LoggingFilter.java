package com.swims.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.StringJoiner;

@Slf4j
@Component
public class LoggingFilter extends OncePerRequestFilter {

    private static final int MAX_BODY_LENGTH = 2000;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        // 1. 请求进入时打印请求信息
        logRequest(requestWrapper);

        long startTime = System.currentTimeMillis();
        filterChain.doFilter(requestWrapper, responseWrapper);
        long duration = System.currentTimeMillis() - startTime;

        // 2. 请求结束时打印响应信息
        logResponse(requestWrapper, responseWrapper, duration);

        responseWrapper.copyBodyToResponse();
    }

    private void logRequest(ContentCachingRequestWrapper request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullUrl = queryString == null ? uri : uri + "?" + queryString;
        String clientIp = getClientIp(request);
        Map<String, String> params = getRequestParams(request);

        log.info("[Request ] {} {} | IP: {} | Params: {}",
                method, fullUrl, clientIp, params);

        if (log.isDebugEnabled() && !isMultipart(request)) {
            String body = getContentAsString(request.getContentAsByteArray());
            if (!body.isEmpty()) {
                log.debug("[RequestBody] {}", truncate(body));
            }
        }
    }

    private void logResponse(ContentCachingRequestWrapper request,
                             ContentCachingResponseWrapper response,
                             long duration) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();

        log.info("[Response] {} {} | Status: {} | Duration: {}ms",
                method, uri, status, duration);

        if (log.isDebugEnabled()) {
            String body = getContentAsString(response.getContentAsByteArray());
            if (!body.isEmpty()) {
                log.debug("[ResponseBody] {}", truncate(body));
            }
        }
    }

    private Map<String, String> getRequestParams(HttpServletRequest request) {
        Map<String, String> params = new LinkedHashMap<>();
        Enumeration<String> names = request.getParameterNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            params.put(name, request.getParameter(name));
        }
        return params;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 多个代理时取第一个 IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    private boolean isMultipart(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith("multipart/");
    }

    private String getContentAsString(byte[] content) {
        if (content == null || content.length == 0) {
            return "";
        }
        return new String(content, StandardCharsets.UTF_8);
    }

    private String truncate(String text) {
        if (text.length() <= MAX_BODY_LENGTH) {
            return text;
        }
        return text.substring(0, MAX_BODY_LENGTH) + "... (truncated)";
    }
}
