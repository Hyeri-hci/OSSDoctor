package com.ossdoctor.Service;

import com.ossdoctor.DTO.LeaderboardUserDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
        ZonedDateTime toDate = ZonedDateTime.now();
        
        log.debug("조회 기간: {} ~ {}", fromDate, toDate);
        
        // totalScore 기준으로 상위 사용자 조회
        PageRequest pageRequest = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalScore"));
        List<UserEntity> users = userRepository.findTopUsersByScore(pageRequest);
        
        log.info("조회된 사용자 수: {}", users.size());
        
        // LeaderboardUserDTO로 변환하고 순위 추가 (실제 기여 데이터 포함)
        AtomicInteger rank = new AtomicInteger(1);
        return users.stream()
                .map(user -> convertToLeaderboardDTOWithRealData(user, rank.getAndIncrement(), fromDate, toDate))
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
        
        // 해당 사용자보다 점수가 높은 사용자 수를 계산해서 순위 도출
        int higherScoreCount = userRepository.countUsersWithHigherScore(user.getTotalScore());
        int userRank = higherScoreCount + 1;
        
        // 기간에 따른 날짜 계산
        ZonedDateTime fromDate = calculateFromDate(period);
        ZonedDateTime toDate = ZonedDateTime.now();
        
        log.info("사용자 {} 의 순위: {}", nickname, userRank);
        
        return LeaderboardUserDTO.builder()
                .userId(user.getIdx())
                .username(user.getNickname())
                .nickname(user.getNickname())
                .avatar(user.getAvatarUrl())
                .totalScore(user.getTotalScore())
                .prCount(calculateRealPRCount(user.getIdx(), fromDate, toDate))
                .issueCount(calculateRealIssueCount(user.getIdx(), fromDate, toDate))
                .commitsCount(calculateRealCommitsCount(user.getIdx(), fromDate, toDate))
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
            case "today" -> now.truncatedTo(ChronoUnit.DAYS); // 오늘 00:00:00
            case "week" -> now.minusDays(now.getDayOfWeek().getValue() - 1).truncatedTo(ChronoUnit.DAYS); // 이번 주 월요일 00:00:00
            case "month" -> now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS); // 이번 달 1일 00:00:00
            default -> now.minusDays(1).truncatedTo(ChronoUnit.DAYS); // 기본값은 오늘
        };
    }

    /**
     * UserEntity를 LeaderboardUserDTO로 변환 (실제 기여 데이터 포함)
     */
    private LeaderboardUserDTO convertToLeaderboardDTOWithRealData(UserEntity user, int rank, ZonedDateTime fromDate, ZonedDateTime toDate) {
        log.info("사용자 {} (ID: {}) 데이터 변환 시작", user.getNickname(), user.getIdx());
        
        return LeaderboardUserDTO.builder()
                .userId(user.getIdx())
                .username(user.getNickname())
                .nickname(user.getNickname())
                .avatar(user.getAvatarUrl())
                .totalScore(user.getTotalScore())
                .prCount(calculateRealPRCount(user.getIdx(), fromDate, toDate))
                .issueCount(calculateRealIssueCount(user.getIdx(), fromDate, toDate))
                .commitsCount(calculateRealCommitsCount(user.getIdx(), fromDate, toDate))
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
            int count = contributionRepository.countPRsByUserAndDateRange(userId, fromDate, toDate);
            log.info("사용자 {} PR 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.warn("PR 수 계산 실패 for user {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    /**
     * 실제 이슈 수 계산
     */
    private Integer calculateRealIssueCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            int count = contributionRepository.countIssuesByUserAndDateRange(userId, fromDate, toDate);
            log.info("사용자 {} 이슈 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.warn("이슈 수 계산 실패 for user {}: {}", userId, e.getMessage());
            return 0;
        }
    }

    /**
     * 실제 커밋 수 계산
     */
    private Integer calculateRealCommitsCount(Long userId, ZonedDateTime fromDate, ZonedDateTime toDate) {
        try {
            int count = contributionRepository.countCommitsByUserAndDateRange(userId, fromDate, toDate);
            log.info("사용자 {} 커밋 수: {} (기간: {} ~ {})", userId, count, fromDate, toDate);
            return count;
        } catch (Exception e) {
            log.warn("커밋 수 계산 실패 for user {}: {}", userId, e.getMessage());
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
}