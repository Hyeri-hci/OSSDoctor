package com.ossdoctor.controller;

import com.ossdoctor.Service.EcosystemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainPageController {

    private final EcosystemService ecosystemService;

    /**
     * 메인 페이지용 추천 프로젝트 조회 (3개 제한)
     */
    @GetMapping("/recommended-projects")
    public ResponseEntity<Map<String, Object>> getMainRecommendedProjects() {
        try {
            // EcosystemService의 추천 로직을 재사용하되 3개로 제한
            Map<String, Object> result = ecosystemService.getRecommendedProjects(3, "beginner-friendly");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("메인 페이지 추천 프로젝트 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}