package com.ossdoctor.controller;

import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.Service.GitHubApiService;
import com.ossdoctor.Service.ScoreService;
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
@CrossOrigin(origins = "http://localhost:5173") // Frontend 개발 서버 주소
public class DiagnoseController {

    private final GitHubApiService gitHubApiService;

    /**
     * 저장소 진단 - 저장소 정보 조회 및 점수 계산
     * @param owner 저장소 소유자
     * @param repo 저장소 이름
     * @return 진단 결과 (저장소 정보 + 점수)
     */
    @GetMapping("/{owner}/{repo}")
    public Mono<ResponseEntity<Map<String, Object>>> diagnoseRepository(
            @PathVariable String owner,
            @PathVariable String repo) {

        log.info("진단 요청: {}/{}", owner, repo);

        return gitHubApiService.getRepositoryInfo(owner, repo)
                .flatMap(repositoryDTO -> {
                    // 기여자 정보 조회
                    return gitHubApiService.getContributors(owner, repo)
                            .flatMap(contributors -> {
                                // 언어 분포 정보 조회
                                return gitHubApiService.getLanguages(owner, repo)
                                        .flatMap(languages -> {
                                            // 커밋 활동 데이터 조회
                                            return gitHubApiService.getCommitActivity(owner, repo)
                                                    .flatMap(commitActivities -> {
                                                        // 최근 활동 이력 조회
                                                        return gitHubApiService.getRecentActivitiesForFrontend(owner, repo)
                                                                .map(recentActivities -> {
                                                                    // GitHubApiService 통해 모든 점수 정보 조회 (소셜 점수 상세 포함)
                                                                    Map<String, Object> allScores = gitHubApiService.getAllScores(owner, repo);

                                                                    // 응답 데이터 구성
                                                                    Map<String, Object> response = new HashMap<>();
                                                                    response.put("repository", repositoryDTO); // 저장소 정보
                                                                    response.put("contributors", contributors); // 주요 기여자 리스트
                                                                    response.put("totalContributors", repositoryDTO.getTotalContributors()); // 총 기여자 수
                                                                    response.put("languages", languages); // 언어 분포
                                                                    response.put("commitActivities", commitActivities); // 커밋 활동 (7일 기준)
                                                                    response.put("recentActivities", recentActivities); // 최근 활동 이력 (PR, ISSUE)
                                                                    response.put("scores", allScores); // 점수 정보 (소셜 점수 포함)

                                                                    return ResponseEntity.ok(response);
                                                                });
                                                    });
                                        });
                            });
                })
                .onErrorResume(throwable -> {
                    log.error("진단 중 오류 발생: {}/{}", owner, repo, throwable);
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "진단 중 오류가 발생했습니다: " + throwable.getMessage());
                    return Mono.just(ResponseEntity.badRequest().body(errorResponse));
                });
    }

    /**
     * 저장소 기본 정보만 조회 (점수 계산 없이)
     * @param owner 저장소 소유자
     * @param repo 저장소 이름
     * @return 저장소 정보
     */
    @GetMapping("/{owner}/{repo}/info")
    public Mono<ResponseEntity<RepositoryDTO>> getRepositoryInfo(
            @PathVariable String owner,
            @PathVariable String repo) {

        log.info("저장소 정보 조회: {}/{}", owner, repo);

        return gitHubApiService.getRepositoryInfo(owner, repo)
                .map(ResponseEntity::ok)
                .onErrorResume(throwable -> {
                    log.error("저장소 정보 조회 중 오류: {}/{}", owner, repo, throwable);
                    return Mono.just(ResponseEntity.badRequest().build());
                });
    }
}
