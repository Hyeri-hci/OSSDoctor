package com.ossdoctor.controller;

import com.ossdoctor.Service.EcosystemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ecosystem")
@RequiredArgsConstructor
public class EcosystemController {

    private final EcosystemService ecosystemService;

    /**
     * 프로젝트 검색 (GraphQL 기반)
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchProjects(
            @RequestParam(required = false, defaultValue = "") String searchQuery,
            @RequestParam(required = false, defaultValue = "") String language,
            @RequestParam(required = false, defaultValue = "") String license,
            @RequestParam(required = false, defaultValue = "") String timeFilter,
            @RequestParam(required = false, defaultValue = "beginner-friendly") String sortBy,
            @RequestParam(required = false, defaultValue = "30") int limit,
            @RequestParam(required = false) String cursor) {
        
        try {
            Map<String, Object> filters = Map.of(
                "searchQuery", searchQuery,
                "language", language,
                "license", license,
                "timeFilter", timeFilter,
                "sortBy", sortBy,
                "limit", limit
            );
            
            Map<String, Object> result = ecosystemService.searchProjects(filters, cursor);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("프로젝트 검색 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 저장소 활동 정보 조회
     */
    @GetMapping("/repository/{owner}/{name}/activity")
    public ResponseEntity<Map<String, Object>> getRepositoryActivity(
            @PathVariable String owner,
            @PathVariable String name,
            @RequestParam(required = false, defaultValue = "week") String timeFilter) {
        
        try {
            Map<String, Object> result = ecosystemService.getRepositoryActivity(owner, name, timeFilter);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("저장소 활동 정보 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 컨트리뷰터 통계 조회
     */
    @GetMapping("/repository/{owner}/{name}/contributors")
    public ResponseEntity<Map<String, Object>> getContributorStats(
            @PathVariable String owner,
            @PathVariable String name,
            @RequestParam(required = false, defaultValue = "month") String timeFilter) {
        
        try {
            Map<String, Object> result = ecosystemService.getContributorStats(owner, name, timeFilter);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("컨트리뷰터 통계 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 추천 프로젝트 조회
     */
    @GetMapping("/recommended")
    public ResponseEntity<Map<String, Object>> getRecommendedProjects(
            @RequestParam(required = false, defaultValue = "10") int count,
            @RequestParam(required = false, defaultValue = "beginner-friendly") String category) {
        
        try {
            Map<String, Object> result = ecosystemService.getRecommendedProjects(count, category);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("추천 프로젝트 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
