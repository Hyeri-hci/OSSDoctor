package com.ossdoctor.controller;

import com.ossdoctor.Service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 서버 상태 정보 제공 컨트롤러
 * 프론트엔드에서 서버 재시작을 감지할 수 있도록 서버 시작 시간 등의 정보를 제공
 */
@RestController
@RequestMapping("/api/server")
@RequiredArgsConstructor
public class ServerStatusController {

    private final JwtService jwtService;

    /**
     * 서버 상태 정보 조회
     * @return 서버 시작 시간, 현재 시간 등의 정보
     */
    @GetMapping("/status")
    public Map<String, Object> getServerStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("serverStartTime", jwtService.getServerStartTime().getTime());
        status.put("currentTime", System.currentTimeMillis());
        status.put("status", "running");
        return status;
    }
}