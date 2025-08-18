package com.ossdoctor.controller;

import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.Service.DiagnoseService;
import com.ossdoctor.Service.GitHubApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/diagnose")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DiagnoseController {

    private final DiagnoseService diagnoseService;
    private final GitHubApiService gitHubApiService;

    /**
     * 저장소 전체 진단 - 저장소 정보 + 기여자 + 언어분포 + 커밋활동 + 점수 등 모든 정보 조회
     * @param owner 저장소 소유자
     * @param repo 저장소 이름
     * @return 통합 진단 결과
     */
    @GetMapping("/{owner}/{repo}")
    public Mono<ResponseEntity<Map<String, Object>>> diagnoseRepository(
            @PathVariable String owner,
            @PathVariable String repo) {

        log.info("🔍 진단 요청: {}/{}", owner, repo);

        return diagnoseService.getFullDiagnosisData(owner, repo)
                .map(ResponseEntity::ok)
                .onErrorResume(throwable -> {
                    log.error("❌ 진단 중 오류 발생: {}/{}", owner, repo, throwable);
                    return Mono.just(ResponseEntity.badRequest().body(createErrorResponse(throwable)));
                })
                .doOnSuccess(response -> log.info("✅ 진단 완료: {}/{}", owner, repo));
    }

    /**
     * 저장소 기본 정보만 조회
     * @param owner 저장소 소유자
     * @param repo 저장소 이름
     * @return 저장소 기본 정보
     */
    @GetMapping("/{owner}/{repo}/info")
    public Mono<ResponseEntity<RepositoryDTO>> getRepositoryInfo(
            @PathVariable String owner,
            @PathVariable String repo) {

        log.info("📋 저장소 정보 조회: {}/{}", owner, repo);

        return gitHubApiService.getRepositoryInfo(owner, repo)
                .map(ResponseEntity::ok)
                .onErrorResume(throwable -> {
                    log.error("❌ 저장소 정보 조회 중 오류: {}/{}", owner, repo, throwable);
                    return Mono.just(ResponseEntity.badRequest().build());
                })
                .doOnSuccess(response -> log.debug("✅ 저장소 정보 조회 완료: {}/{}", owner, repo));
    }

    // 에러 응답 생성
    private Map<String, Object> createErrorResponse(Throwable throwable) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "진단 중 오류가 발생했습니다");
        errorResponse.put("message", throwable.getMessage());
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }
}
