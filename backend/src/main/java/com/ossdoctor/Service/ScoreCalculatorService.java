package com.ossdoctor.Service;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@Component
public class ScoreCalculatorService {

    // 점수 구간 정의 (내림차순 정렬)
    private static final Map<Integer, Integer> COMMIT_THRESHOLDS = Map.of(
            1024, 25, 512, 20, 256, 15, 128, 10, 64, 5
    );

    private static final Map<Integer, Integer> STAR_THRESHOLDS = Map.of(
            1024, 25, 512, 20, 256, 15, 128, 10, 64, 5
    );

    private static final Map<Integer, Integer> FORK_THRESHOLDS = Map.of(
            256, 25, 128, 20, 64, 15, 32, 10, 16, 5
    );

    private static final Map<Integer, Integer> WATCHER_THRESHOLDS = Map.of(
            128, 25, 64, 20, 32, 15, 16, 10, 8, 5
    );

    private static final Map<Integer, Integer> CONTRIBUTOR_THRESHOLDS = Map.of(
            128, 25, 64, 20, 32, 15, 16, 10, 8, 5
    );

    private static final Map<Integer, Integer> PR_THRESHOLDS = Map.of(
            512, 25, 256, 20, 128, 15, 64, 10, 32, 5
    );

    private static final Map<Integer, Integer> ISSUE_THRESHOLDS = Map.of(
            512, 25, 256, 20, 128, 15, 64, 10, 32, 5
    );

    // ========== 건강도 점수 계산 메서드들 ==========
    // 커밋 점수 계산 - 전체 커밋 수 기준
    public int calculateCommitScore(int totalCommits) {
        return calculateScoreByThreshold(totalCommits, COMMIT_THRESHOLDS);
    }

    // 업데이트 점수 계산 - 마지막 업데이트로부터 경과 일수 기준
    public int calculateUpdateScore(LocalDate lastUpdated) {
        long daysSince = getDaysSinceLast(lastUpdated);

        if (daysSince <= 7) return 25;
        else if (daysSince <= 30) return 20;
        else if (daysSince <= 90) return 15;
        else if (daysSince <= 180) return 10;
        else if (daysSince <= 365) return 5;
        else return 0;
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

    // 점수 계산을 위한 공통 메서드
    private int calculateScoreByThreshold(int value, Map<Integer, Integer> thresholds) {
        return thresholds.entrySet().stream()
                .filter(entry -> value >= entry.getKey())
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
