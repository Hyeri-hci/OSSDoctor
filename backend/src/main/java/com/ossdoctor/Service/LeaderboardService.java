package com.ossdoctor.Service;

import com.ossdoctor.DTO.LeaderboardUserDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ContributionRepository contributionRepository;

    /**
     * 기간별 리더보드 조회
     * @param period today, week, month
     * @param limit 조회할 사용자 수
     * @return 리더보드 데이터
     */
    public List<LeaderboardUserDTO> getLeaderboard(String period, int limit) {
        log.info("리더보드 조회 시작 - 기간: {}, 제한: {}", period, limit);
        
        // 전체 기여 데이터 수 확인
        long totalContributions = contributionRepository.count();
        log.info("데이터베이스 전체 기여 데이터 수: {}", totalContributions);
        
        // 기간에 따른 날짜 계산
        ZonedDateTime fromDate = calculateFromDate(period);
        ZonedDateTime toDate = calculateToDate(period);
        
        log.debug("조회 기간: {} ~ {}", fromDate, toDate);
        
        // 모든 사용자 조회 후 기간별 점수로 정렬
        List<UserEntity> users = userRepository.findAll();
        
        log.info("조회된 전체 사용자 수: {}", users.size());
        
        // 기간별 점수 계산 및 정렬
        AtomicInteger rank = new AtomicInteger(1);
        return users.stream()
                .map(user -> convertToLeaderboardDTOWithRealData(user, 0, fromDate, toDate, period)) // rank는 나중에 설정
                .filter(dto -> dto.getPeriodScore() > 0) // 기간 내 기여가 있는 사용자만
                .sorted((a, b) -> b.getPeriodScore().compareTo(a.getPeriodScore())) // 기간별 점수 내림차순
                .limit(limit)
                .map(dto -> {
                    dto.setRank(rank.getAndIncrement());
                    return dto;
                })
                .toList();
    }

    /**
     * 특정 사용자의 순위 조회
     * @param nickname 사용자 닉네임
     * @param period 기간
     * @return 사용자 순위 정보
     */
    public LeaderboardUserDTO getUserRank(String nickname, String period) {
        log.info("사용자 순위 조회 시작 - 닉네임: {}, 기간: {}", nickname, period);
        
        Optional<UserDTO> userOpt = userService.findByUsername(nickname);
        if (userOpt.isEmpty()) {
            log.warn("사용자를 찾을 수 없음: {}", nickname);
            return null;
        }
        
        UserDTO user = userOpt.get();
        
        // 기간에 따른 날짜 계산
        ZonedDateTime fromDate = calculateFromDate(period);
        ZonedDateTime toDate = calculateToDate(period);
        
        // 기간별 점수 계산
        int periodScore = calculatePeriodScore(user.getIdx(), fromDate, toDate);
        
        // 해당 사용자보다 기간별 점수가 높은 사용자 수를 계산해서 순위 도출
        int higherScoreCount = countUsersWithHigherPeriodScore(periodScore, fromDate, toDate);
        int userRank = higherScoreCount + 1;
        
        log.info("사용자 {} 의 순위: {} (기간별 점수: {})", nickname, userRank, periodScore);
        
        return LeaderboardUserDTO.builder()
                .userId(user.getIdx())
                .username(user.getNickname())
                .nickname(user.getNickname())
                .avatar(user.getAvatarUrl())
                .totalScore(user.getTotalScore())
                .periodScore(periodScore)
                .prCount(calculateRealMergedPRCount(user.getIdx(), fromDate, toDate)) // MERGED PR만 카운트
                .issueCount(calculateRealIssueCount(user.getIdx(), fromDate, toDate))
                .commitsCount(calculateRealCommitsCount(user.getIdx(), fromDate, toDate))
                .reviewCount(calculateRealReviewCount(user.getIdx(), fromDate, toDate)) // 리뷰 수 추가
                .contributionStreak(calculateRealContributionStreak(user.getIdx()))
                .joinDate(user.getJoinedAt())
                .rank(userRank)
                .build();
    }

    /**
     * 기간에 따른 시작 날짜 계산
     */
    private ZonedDateTime calculateFromDate(String period) {
        ZonedDateTime now = ZonedDateTime.now();
        
        return switch (period.toLowerCase()) {
            case "today" -> now.toLocalDate().atStartOfDay(now.getZone()); // 오늘 00:00:00 (타임존 유지)
            case "week" -> now.minusDays(now.getDayOfWeek().getValue() - 1).truncatedTo(ChronoUnit.DAYS); // 이번 주 월요일 00:00:00
            case "month" -> now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS); // 이번 달 1일 00:00:00
            default -> now.toLocalDate().atStartOfDay(now.getZone()); // 기본값은 오늘
        };
    }

    /**
     * 기간에 따른 종료 날짜 계산
     */
    private ZonedDateTime calculateToDate(String period) {
        ZonedDateTime now = ZonedDateTime.now();
        
        return switch (period.toLowerCase()) {
            case "today" -> now.toLocalDate().plusDays(1).atStartOfDay(now.getZone()); // 내일 00:00:00 (오늘 끝)
            case "week" -> now.minusDays(now.getDayOfWeek().getValue() - 1).plusWeeks(1).truncatedTo(ChronoUnit.DAYS); // 다음 주 월요일 00:00:00
            case "month" -> now.withDayOfMonth(1).plusMonths(1).truncatedTo(ChronoUnit.DAYS); // 다음 달 1일 00:00:00
            default -> now.toLocalDate().plusDays(1).atStartOfDay(now.getZone()); // 기본값은 내일 00:00:00
        };
    }

    /**
     * UserEntity를 LeaderboardUserDTO로 변환 (실제 기여 데이터 포함)
     */
    private LeaderboardUserDTO convertToLeaderboardDTOWithRealData(UserEntity user, int rank, ZonedDateTime fromDate, ZonedDateTime toDate, String period) {
        log.info("사용자 {} (ID: {}) 데이터 변환 시작", user.getNickname(), user.getIdx());
        
        // 기간별 점수 계산
        int periodScore = calculatePeriodScore(user.getIdx(), fromDate, toDate);
        
        return LeaderboardUserDTO.builder()
                .userId(user.getIdx())
                .username(user.getNickname())
                .nickname(user.getNickname())
                .avatar(user.getAvatarUrl())
                .totalScore(user.getTotalScore())
                .periodScore(periodScore)
                .prCount(calculateRealMergedPRCount(user.getIdx(), fromDate, toDate)) // MERGED PR만 카운트
                .issueCount(calculateRealIssueCount(user.getIdx(), fromDate, toDate))
                .commitsCount(calculateRealCommitsCount(user.getIdx(), fromDate, toDate))
                .reviewCount(calculateRealReviewCount(user.getIdx(), fromDate, toDate)) // 리뷰 수 추가
                .contributionStreak(calculateRealContributionStreak(user.getIdx()))
                .joinDate(user.getJoinedAt())
                .rank(rank)
                .build();
    }

    // 실제 데이터베이스에서 기여 데이터 계산하는 메소드들

    /**
     * 실제 PR 수 계산
     */
    private Integer calculateRealPRCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            log.debug("PR 수 계산 시작 - 사용자: {}, 기간: {} ~ {}", userId, fromDate, toDate);
            int count = contributionRepository.countPRsByUserAndDateRange(userId, fromDate, toDate);
            log.debug("사용자 {} PR 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.error("PR 수 계산 실패 for user {}: {}", userId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 실제 이슈 수 계산
     */
    private Integer calculateRealIssueCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            log.debug("이슈 수 계산 시작 - 사용자: {}, 기간: {} ~ {}", userId, fromDate, toDate);
            int count = contributionRepository.countIssuesByUserAndDateRange(userId, fromDate, toDate);
            log.debug("사용자 {} 이슈 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.error("이슈 수 계산 실패 for user {}: {}", userId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 실제 커밋 수 계산
     */
    private Integer calculateRealCommitsCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            log.debug("커밋 수 계산 시작 - 사용자: {}, 기간: {} ~ {}", userId, fromDate, toDate);
            int count = contributionRepository.countCommitsByUserAndDateRange(userId, fromDate, toDate);
            log.debug("사용자 {} 커밋 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.error("커밋 수 계산 실패 for user {}: {}", userId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 실제 MERGED 상태인 PR 수 계산 (경험치 시스템과 동일)
     */
    private Integer calculateRealMergedPRCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            log.debug("MERGED PR 수 계산 시작 - 사용자: {}, 기간: {} ~ {}", userId, fromDate, toDate);
            int count = contributionRepository.countMergedPRsByUserAndDateRange(userId, fromDate, toDate);
            log.debug("사용자 {} MERGED PR 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.error("MERGED PR 수 계산 실패 for user {}: {}", userId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 실제 리뷰 수 계산
     */
    private Integer calculateRealReviewCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            log.debug("리뷰 수 계산 시작 - 사용자: {}, 기간: {} ~ {}", userId, fromDate, toDate);
            int count = contributionRepository.countReviewsByUserAndDateRange(userId, fromDate, toDate);
            log.debug("사용자 {} 리뷰 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.error("리뷰 수 계산 실패 for user {}: {}", userId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 실제 연속 기여 일수 계산
     */
    private Integer calculateRealContributionStreak(Long userId) {
        try {
            List<ContributionEntity> contributions = contributionRepository.findContributionsByUser(userId);
            
            if (contributions.isEmpty()) {
                log.info("사용자 {} 기여 데이터 없음", userId);
                return 0;
            }
            
            // 엔티티에서 날짜만 추출하고 중복 제거 및 정렬
            List<LocalDate> uniqueDates = contributions.stream()
                    .map(c -> c.getContributedAt().toLocalDate())
                    .distinct()
                    .sorted((d1, d2) -> d2.compareTo(d1)) // 최신 날짜부터
                    .toList();
            
            // 연속 일수 계산
            int streak = 0;
            LocalDate today = LocalDate.now();
            LocalDate checkDate = today;
            
            // 오늘부터 시작해서 연속으로 기여한 날짜를 찾음
            for (LocalDate contributionDate : uniqueDates) {
                if (contributionDate.equals(checkDate) || contributionDate.equals(checkDate.minusDays(1))) {
                    streak++;
                    checkDate = contributionDate.minusDays(1);
                } else {
                    break;
                }
            }
            
            log.info("사용자 {} 연속 기여 일수: {}", userId, streak);
            return streak;
        } catch (Exception e) {
            log.warn("연속 기여 일수 계산 실패 for user {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    /**
     * 기간별 점수 계산
     * PR MERGED: 20점, ISSUE: 10점, REVIEW: 5점, COMMIT: 0점 (경험치 시스템과 동일)
     */
    private Integer calculatePeriodScore(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            log.debug("사용자 {} 기간별 점수 계산 시작 - 기간: {} ~ {}", userId, fromDate, toDate);
            
            int mergedPrCount = calculateRealMergedPRCount(userId, fromDate, toDate);
            int issueCount = calculateRealIssueCount(userId, fromDate, toDate);
            int reviewCount = calculateRealReviewCount(userId, fromDate, toDate);
            
            // 점수 계산 (PR MERGED: 20점, ISSUE: 10점, REVIEW: 5점, COMMIT: 0점)
            int periodScore = (mergedPrCount * 20) + (issueCount * 10) + (reviewCount * 5);
            
            log.info("사용자 {} 기간별 점수: {} (PR MERGED: {}x20 + ISSUE: {}x10 + REVIEW: {}x5)", 
                    userId, periodScore, mergedPrCount, issueCount, reviewCount);
            
            return periodScore;
        } catch (Exception e) {
            log.error("기간별 점수 계산 실패 for user {}: {}", userId, e.getMessage(), e);
            return 0;
        }
    }

    /**
     * 특정 기간별 점수보다 높은 점수를 가진 사용자 수 계산
     */
    private Integer countUsersWithHigherPeriodScore(int targetScore, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            List<UserEntity> allUsers = userRepository.findAll();
            
            long higherScoreCount = allUsers.stream()
                    .mapToInt(user -> calculatePeriodScore(user.getIdx(), fromDate, toDate))
                    .filter(score -> score > targetScore)
                    .count();
            
            return (int) higherScoreCount;
        } catch (Exception e) {
            log.warn("높은 기간별 점수 사용자 수 계산 실패: {}", e.getMessage());
            return 0;
        }
    }
}