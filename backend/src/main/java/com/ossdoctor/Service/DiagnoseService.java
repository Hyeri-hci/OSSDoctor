package com.ossdoctor.Service;

import com.ossdoctor.DTO.RepositoryDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiagnoseService {

    private final GitHubApiService gitHubApiService;

    /**
     * 저장소 전체 진단 정보 조회
     * @param owner 저장소 소유자
     * @param repo 저장소 이름
     * @return 통합 진단 결과
     */
    public Mono<Map<String, Object>> getFullDiagnosisData(String owner, String repo) {
        return gitHubApiService.getRepositoryInfo(owner, repo)
                .flatMap(repositoryDTO -> collectAllDiagnosisData(owner, repo, repositoryDTO))
                .doOnError(error -> log.error("진단 데이터 수집 실패: {}/{}", owner, repo, error));
    }

    /**
     * 모든 진단 데이터를 병렬로 수집하고 통합
     */
    private Mono<Map<String, Object>> collectAllDiagnosisData(String owner, String repo, RepositoryDTO repositoryDTO) {
        // 병렬로 데이터 수집
        Mono<Object> contributorsMono = gitHubApiService.getContributors(owner, repo)
                .cast(Object.class)
                .onErrorReturn("기여자 데이터 로딩 실패");

        Mono<Object> languagesMono = gitHubApiService.getLanguages(owner, repo)
                .cast(Object.class)
                .onErrorReturn(Map.of());

        Mono<Object> commitActivitiesMono = gitHubApiService.getCommitActivity(owner, repo)
                .cast(Object.class)
                .onErrorReturn(Map.of());

        Mono<Object> recentActivitiesMono = gitHubApiService.getRecentActivitiesForFrontend(owner, repo)
                .cast(Object.class)
                .onErrorReturn(Map.of());

        // 모든 데이터를 병렬로 수집하고 통합
        return Mono.zip(contributorsMono, languagesMono, commitActivitiesMono, recentActivitiesMono)
                .map(tuple -> buildDiagnosisResponse(
                        repositoryDTO,
                        tuple.getT1(),
                        tuple.getT2(),
                        tuple.getT3(),
                        tuple.getT4(),
                        owner,
                        repo
                ));
    }

    /**
     * 진단 응답 데이터 구성
     */
    private Map<String, Object> buildDiagnosisResponse(
            RepositoryDTO repositoryDTO,
            Object contributors,
            Object languages,
            Object commitActivities,
            Object recentActivities,
            String owner,
            String repo) {

        Map<String, Object> response = new HashMap<>();

        // 기본 정보
        response.put("repository", repositoryDTO);
        response.put("contributors", contributors);
        response.put("totalContributors", repositoryDTO.getTotalContributors());

        // 부가 정보
        response.put("languages", languages);
        response.put("commitActivities", commitActivities);
        response.put("recentActivities", recentActivities);

        // 점수 정보 (에러 발생 시 기본값 제공)
        try {
            Map<String, Object> allScores = gitHubApiService.getAllScores(owner, repo);
            response.put("scores", allScores);
        } catch (Exception e) {
            log.warn("점수 계산 실패: {}/{}", owner, repo, e);
            response.put("scores", createDefaultScores());
        }

        return response;
    }

    /**
     * 기본 점수 정보 생성 (에러 발생 시 사용)
     */
    private Map<String, Object> createDefaultScores() {
        Map<String, Object> defaultScores = new HashMap<>();
        defaultScores.put("healthScore", 0);
        defaultScores.put("socialScore", 0);
        defaultScores.put("totalScore", 0);
        defaultScores.put("healthDetails", Map.of());
        defaultScores.put("socialDetails", Map.of());
        return defaultScores;
    }
}
