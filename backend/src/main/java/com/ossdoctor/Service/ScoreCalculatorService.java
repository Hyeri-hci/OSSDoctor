package com.ossdoctor.Service;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class ScoreCalculatorService {

    // 점수 구간 정의 (내림차순 정렬) - LinkedHashMap 순서 보장
    private static final Map<Integer, Integer> COMMIT_THRESHOLDS = new LinkedHashMap<>() {{
        put(1024, 25); put(512, 20); put(256, 15); put(128, 10); put(64, 5);
    }};

    private static final Map<Integer, Integer> STAR_THRESHOLDS = new LinkedHashMap<>() {{
        put(1024, 25); put(512, 20); put(256, 15); put(128, 10); put(64, 5);
    }};

    private static final Map<Integer, Integer> FORK_THRESHOLDS = new LinkedHashMap<>() {{
        put(256, 25); put(128, 20); put(64, 15); put(32, 10); put(16, 5);
    }};

    private static final Map<Integer, Integer> WATCHER_THRESHOLDS = new LinkedHashMap<>() {{
        put(128, 25); put(64, 20); put(32, 15); put(16, 10); put(8, 5);
    }};

    private static final Map<Integer, Integer> CONTRIBUTOR_THRESHOLDS = new LinkedHashMap<>() {{
        put(128, 25); put(64, 20); put(32, 15); put(16, 10); put(8, 5);
    }};

    private static final Map<Integer, Integer> PR_THRESHOLDS = new LinkedHashMap<>() {{
        put(512, 25); put(256, 20); put(128, 15); put(64, 10); put(32, 5);
    }};

    private static final Map<Integer, Integer> ISSUE_THRESHOLDS = new LinkedHashMap<>() {{
        put(512, 25); put(256, 20); put(128, 15); put(64, 10); put(32, 5);
    }};

    // 업데이트 점수 임계값 (일수 기준)
    private static final Map<Long, Integer> UPDATE_THRESHOLDS = new LinkedHashMap<>() {{
        put(7L, 25); put(30L, 20); put(90L, 15); put(180L, 10); put(365L, 5);
    }};

    // ========== 건강도 점수 계산 메서드들 ==========
    // 커밋 점수 계산 - 전체 커밋 수 기준
    public int calculateCommitScore(int totalCommits) {
        return calculateScoreByThreshold(totalCommits, COMMIT_THRESHOLDS);
    }

    // 업데이트 점수 계산 - 마지막 업데이트로부터 경과 일수 기준
    public int calculateUpdateScore(LocalDate lastUpdated) {
        long daysSince = getDaysSinceLast(lastUpdated);
        return calculateScoreByDaysThreshold(daysSince);
    }

    // PR 점수 계산 - 병합된 PR 수 기준
    public int calculatePRScore(int mergedPRs) {
        return calculateScoreByThreshold(mergedPRs, PR_THRESHOLDS);
    }

    // 이슈 점수 계산 - 닫힌 이슈 수 기준
    public int calculateIssueScore(int closedIssues) {
        return calculateScoreByThreshold(closedIssues, ISSUE_THRESHOLDS);
    }

    // ========== 소셜 점수 계산 메서드들 ==========
    // 스타 점수 계산
    public int calculateStarScore(int stars) {
        return calculateScoreByThreshold(stars, STAR_THRESHOLDS);
    }

    // 포크 점수 계산
    public int calculateForkScore(int forks) {
        return calculateScoreByThreshold(forks, FORK_THRESHOLDS);
    }

    // 워처 점수 계산
    public int calculateWatcherScore(int watchers) {
        return calculateScoreByThreshold(watchers, WATCHER_THRESHOLDS);
    }

    // 기여자 점수 계산 - 총 기여자 수 기준
    public int calculateContributorScore(int totalContributors) {
        return calculateScoreByThreshold(totalContributors, CONTRIBUTOR_THRESHOLDS);
    }

    // ========== 유틸리티 메서드 ==========

    /**
     * 임계값 맵을 기반으로 점수 계산하는 공통 메서드
     * @param value 평가할 값
     * @param thresholds 임계값-점수 맵 (내림차순 정렬 필요)
     * @return 계산된 점수
     */
    private int calculateScoreByThreshold(int value, Map<Integer, Integer> thresholds) {
        return thresholds.entrySet().stream()
                .filter(entry -> value >= entry.getKey())
                .findFirst()
                .map(Map.Entry::getValue)
                .orElse(0);
    }

    /**
     * 일수 임계값 맵을 기반으로 점수 계산하는 메서드
     *
     * @param daysSince 경과 일수
     * @return 계산된 점수
     */
    private int calculateScoreByDaysThreshold(long daysSince) {
        return ScoreCalculatorService.UPDATE_THRESHOLDS.entrySet().stream()
                .filter(entry -> daysSince <= entry.getKey())
                .findFirst()
                .map(Map.Entry::getValue)
                .orElse(0);
    }

    // 마지막 날짜로부터 경과 일수 계산
    private long getDaysSinceLast(LocalDate date) {
        if (date == null) return 999;
        return ChronoUnit.DAYS.between(date, LocalDate.now());
    }
}
