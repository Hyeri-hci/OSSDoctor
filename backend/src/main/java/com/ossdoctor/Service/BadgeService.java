package com.ossdoctor.Service;

import com.ossdoctor.DTO.*;
import com.ossdoctor.Entity.BADGE_CATEGORY;
import com.ossdoctor.Entity.BadgeEntity;
import com.ossdoctor.Entity.UserBadgeEntity;
import com.ossdoctor.Repository.BadgeRepository;
import com.ossdoctor.Repository.UserBadgeRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@AllArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeService userBadgeService;
    private final UserService userService;
    private final GitHubApiService gitHubApiService;

    public boolean existsByName(String name){
        return badgeRepository.existsByName(name);
    }

    public BadgeDTO save(BadgeDTO badgeDTO) {
        return toDto(badgeRepository.save(toEntity(badgeDTO)));
    }

    private BadgeDTO toDto(BadgeEntity entity) {
        return BadgeDTO.builder()
                .idx(entity.getIdx())
                .name(entity.getName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .level(entity.getLevel())
                .requirement(entity.getRequirement())
                .build();
    }

    private BadgeEntity toEntity(BadgeDTO dto) {
        return BadgeEntity.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .level(dto.getLevel())
                .requirement(dto.getRequirement())
                .build();
    }

    private static final Map<Integer, Integer> COMMIT_THRESHOLDS = new LinkedHashMap<>() {{put(1, 1);put(2, 20);put(3, 50);put(4, 100);}};
    private static final Map<Integer, Integer> PR_THRESHOLDS = new LinkedHashMap<>() {{put(1, 1);put(2, 5);put(3, 10);put(4, 30);}};
    private static final Map<Integer, Integer> MERGED_PR_THRESHOLDS = new LinkedHashMap<>() {{put(1, 1);put(2, 5);put(3, 10);put(4, 20);}};
    private static final Map<Integer, Integer> ISSUE_CREATE_THRESHOLDS = new LinkedHashMap<>() {{put(1, 1);put(2, 5);put(3, 10);put(4, 30);}};
    private static final Map<Integer, Integer> ISSUE_SOLVE_THRESHOLDS = new LinkedHashMap<>() {{put(1, 1);put(2, 5);put(3, 10);put(4, 30);}};
    private static final Map<Integer, Integer> STAR_THRESHOLDS = new LinkedHashMap<>() {{put(1, 10);put(2, 30);put(3, 50);put(4, 100);}};
    private static final Map<Integer, Integer> FORK_THRESHOLDS = new LinkedHashMap<>() {{put(1, 5);put(2, 10);put(3, 15);put(4, 20);}};
    private static final Map<Integer, Integer> WATCH_THRESHOLDS = new LinkedHashMap<>() {{put(1, 5);put(2, 10);put(3, 15);put(4, 20);}};
    private static final Map<Integer, Integer> REVIEW_THRESHOLDS = new LinkedHashMap<>() {{put(1, 1); put(2, 5); put(3, 10); put(4, 30);}};

    /*public Mono<Void> awardContributionBadges(String nickname, List<BadgeMetricDTO> metrics) {
        return Mono.justOrEmpty(userService.findByUsername(nickname))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("사용자 {}를 찾을 수 없어 dabbun으로 대체 시도", nickname);
                    return Mono.justOrEmpty(userService.findByUsername("dabbun"))
                            .switchIfEmpty(Mono.error(new RuntimeException("Default user 'dabbun' not found")));
                }))
                .flatMap(user -> {
                    for (BadgeMetricDTO metric : metrics) {
                        Map<Integer, Integer> thresholds = getThresholdsForCategory(metric.getBadgeCategory());

                        thresholds.forEach((level, requiredCount) -> {
                            boolean alreadyAwarded = userBadgeService.existsByUserIdAndBadgeLevelAndBadgeCategory(
                                    user.getIdx(), level, metric.getBadgeCategory()
                            );

                            if (!alreadyAwarded && metric.getCount() >= requiredCount) {
                                BadgeEntity badge = badgeRepository.findByCategoryAndLevel(
                                        metric.getBadgeCategory(), level
                                ).orElseThrow(() -> new RuntimeException("Badge not found"));

                                userBadgeService.save(UserBadgeDTO.builder()
                                        .userId(user.getIdx())
                                        .badgeId(badge.getIdx())
                                        .build());

                                log.info("사용자 {}에게 {} 레벨 {} 뱃지 지급", nickname, metric.getBadgeCategory(), level);
                            }
                        });
                    }

                    return Mono.empty();
                });
    }

    // 소셜 관련 뱃지
    public Mono<Void> awardSocialBadges(String nickname, List<BadgeMetricDTO> metrics) {
        return Mono.justOrEmpty(userService.findByUsername(nickname))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("사용자 {}를 찾을 수 없어 dabbun으로 대체 시도", nickname);
                    return Mono.justOrEmpty(userService.findByUsername("dabbun"))
                            .switchIfEmpty(Mono.error(new RuntimeException("Default user 'dabbun' not found")));
                }))
                .flatMap(user -> {
                    for (BadgeMetricDTO metric : metrics) {
                        Map<Integer, Integer> thresholds = getThresholdsForCategory(metric.getBadgeCategory());

                        thresholds.forEach((level, requiredCount) -> {
                            boolean alreadyAwarded = userBadgeService.existsByUserIdAndBadgeLevelAndBadgeCategory(
                                    user.getIdx(), level, metric.getBadgeCategory()
                            );

                            if (!alreadyAwarded && metric.getCount() >= requiredCount) {
                                BadgeEntity badge = badgeRepository.findByCategoryAndLevel(
                                        metric.getBadgeCategory(), level
                                ).orElseThrow(() -> new RuntimeException("Badge not found"));

                                userBadgeService.save(UserBadgeDTO.builder()
                                        .userId(user.getIdx())
                                        .badgeId(badge.getIdx())
                                        .build());

                                log.info("사용자 {}에게 {} 레벨 {} 뱃지 지급", nickname, metric.getBadgeCategory(), level);
                            }
                        });
                    }

                    return Mono.empty();
                });
    }*/

    public Mono<List<UserBadgeDTO>> processAllBadges(String nickname) {
        return Mono.justOrEmpty(userService.findByUsername(nickname))
                // 임시 테스트용
                .switchIfEmpty(
                        Mono.defer(() -> {
                            UserDTO newUser = UserDTO.builder()
                                    .nickname(nickname)
                                    .githubId(0L) // 임시 ID
                                    .level(1)
                                    .build();
                            return Mono.just(userService.save(newUser));
                        })
                )
                .flatMap(user -> {
                    // 초기 설정: 항상 가입일 기준 1달 전부터 조회
                    LocalDateTime since = user.getJoinedAt().minusMonths(1);

                    return gitHubApiService.getContributionSummary(user.getNickname(), since) // 먼저 기여 관련 데이터 가져오기
                            .zipWith(gitHubApiService.getSocialCount(user.getNickname())) // 소셜 관련 데이터를 가져오기
                            .flatMap(tuple -> { // 하나로 묶기
                                List<BadgeMetricDTO> allMetrics = new ArrayList<>();
                                allMetrics.addAll(tuple.getT1());
                                allMetrics.addAll(tuple.getT2());

                                return awardAllBadges(user.getNickname(), allMetrics);
                            });
                });
    }

    public Mono<List<UserBadgeDTO>> awardAllBadges(String nickname, List<BadgeMetricDTO> metrics) {
        return Mono.justOrEmpty(userService.findByUsername(nickname))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("사용자 {}를 찾을 수 없어 dabbun으로 대체 시도", nickname);
                    return Mono.justOrEmpty(userService.findByUsername("dabbun"))
                            .switchIfEmpty(Mono.error(new RuntimeException("Default user 'dabbun' not found")));
                }))
                .flatMap(user -> {
                    metrics.forEach(metric -> awardBadgeIfEligible(user, metric));
                    return userBadgeService.getBadgesByNickname(user.getNickname());
                });
    }

    // 공통 뱃지 지급 로직(조건 체크)
    private void awardBadgeIfEligible(UserDTO user, BadgeMetricDTO metric) {
        Map<Integer, Integer> thresholds = getThresholdsForCategory(metric.getBadgeCategory()); // 조건

        thresholds.forEach((level, requiredCount) -> {
            // 지급 확인 -> 지급O : 중복 지급 X
            boolean alreadyAwarded = userBadgeService.existsByUserIdAndBadgeLevelAndBadgeCategory(
                    user.getIdx(), level, metric.getBadgeCategory()
            );

            if (!alreadyAwarded && metric.getCount() >= requiredCount) {
                // 실제 뱃지 찾기
                BadgeEntity badge = badgeRepository.findByCategoryAndLevel(
                        metric.getBadgeCategory(), level
                ).orElseThrow(() -> new RuntimeException("Badge not found"));

                // DB 저장
                userBadgeService.save(UserBadgeDTO.builder()
                        .userId(user.getIdx())
                        .badgeId(badge.getIdx())
                        .build());

                log.info("사용자 {}에게 {} 레벨 {} 뱃지 지급", user.getNickname(), metric.getBadgeCategory(), level);
            }
        });
    }

    // BADGE_CATEGORY별 Threshold
    private Map<Integer, Integer> getThresholdsForCategory(BADGE_CATEGORY category) {
        return switch (category) {
            case STAR -> STAR_THRESHOLDS;
            case FORK -> FORK_THRESHOLDS;
            case WATCH -> WATCH_THRESHOLDS;
            case COMMIT -> COMMIT_THRESHOLDS;
            case PR_EXTERNAL -> PR_THRESHOLDS;
            case PR_MERGE -> MERGED_PR_THRESHOLDS;
            case ISSUE_CREATE -> ISSUE_CREATE_THRESHOLDS;
            case ISSUE_SOLVE -> ISSUE_SOLVE_THRESHOLDS;
            case CODE_REVIEW -> REVIEW_THRESHOLDS;
            default -> Map.of(); // 나머지는 빈 Map
        };
    }

}
