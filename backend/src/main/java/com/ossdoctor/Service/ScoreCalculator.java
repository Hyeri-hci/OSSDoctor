package com.ossdoctor.Service;

import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class ScoreCalculator {

    // ========== 건강도 점수 계산 메서드들 ==========
    // 커밋 점수 계산 - 전체 커밋 수 기준
    public int calculateCommitScore(int totalCommits) {
        if (totalCommits >= 1024) return 25;
        else if (totalCommits >= 512) return 20;
        else if (totalCommits >= 256) return 15;
        else if (totalCommits >= 128) return 10;
        else if (totalCommits >= 64) return 5;
        else return 0;
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
        if (mergedPRs >= 512) return 25;
        else if (mergedPRs >= 256) return 20;
        else if (mergedPRs >= 128) return 15;
        else if (mergedPRs >= 64) return 10;
        else if (mergedPRs >= 32) return 5;
        else return 0;
    }

    // 이슈 점수 계산 - 닫힌 이슈 수 기준
    public int calculateIssueScore(int closedIssues) {
        if (closedIssues >= 512) return 25;
        else if (closedIssues >= 256) return 20;
        else if (closedIssues >= 128) return 15;
        else if (closedIssues >= 64) return 10;
        else if (closedIssues >= 32) return 5;
        else return 0;
    }

    // ========== 소셜 점수 계산 메서드들 ==========
    // 스타 점수 계산
    public int calculateStarScore(int stars) {
        if (stars >= 1024) return 25;
        else if (stars >= 512) return 20;
        else if (stars >= 256) return 15;
        else if (stars >= 128) return 10;
        else if (stars >= 64) return 5;
        else return 0;
    }

    // 포크 점수 계산
    public int calculateForkScore(int forks) {
        if (forks >= 256) return 25;
        else if (forks >= 128) return 20;
        else if (forks >= 64) return 15;
        else if (forks >= 32) return 10;
        else if (forks >= 16) return 5;
        else return 0;
    }

    // 워처 점수 계산
    public int calculateWatcherScore(int watchers) {
        if (watchers >= 128) return 25;
        else if (watchers >= 64) return 20;
        else if (watchers >= 32) return 15;
        else if (watchers >= 16) return 10;
        else if (watchers >= 8) return 5;
        else return 0;
    }

    // 기여자 점수 계산 - 총 기여자 수 기준
    public int calculateContributorScore(int totalContributors) {
        if (totalContributors >= 128) return 25;
        else if (totalContributors >= 64) return 20;
        else if (totalContributors >= 32) return 15;
        else if (totalContributors >= 16) return 10;
        else if (totalContributors >= 8) return 5;
        else return 0;
    }

    // ========== 유틸리티 메서드 ==========
    // 마지막 날짜로부터 경과 일수 계산
    private long getDaysSinceLast(LocalDate date) {
        if (date == null) return 999;
        return ChronoUnit.DAYS.between(date, LocalDate.now());
    }
}
