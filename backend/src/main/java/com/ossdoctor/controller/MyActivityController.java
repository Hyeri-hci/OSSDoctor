package com.ossdoctor.controller;

import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.CONTRIBUTION_TYPE;
import com.ossdoctor.Service.ContributionService;
import com.ossdoctor.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/my-activity")
@RequiredArgsConstructor
public class MyActivityController {

    private final ContributionService contributionService;
    private final UserService userService;

    /**
     * 사용자 기여 통계 조회 (Overview 탭용)
     */
    @GetMapping("/stats/{nickname}")
    public Mono<ResponseEntity<Map<String, Object>>> getUserStats(@PathVariable String nickname) {
        log.info("사용자 통계 조회 요청: {}", nickname);
        
        // 사용자 존재 확인 및 없으면 생성
        return Mono.fromCallable(() -> {
            Optional<UserDTO> userOpt = userService.findByUsername(nickname);
            if (userOpt.isEmpty()) {
                log.warn("통계 조회 - 사용자를 찾을 수 없어서 생성: {}", nickname);
                createDefaultUser(nickname);
            }
            return nickname;
        })
        .flatMap(name -> {
            // 매번 GitHub에서 최신 데이터를 가져와서 업데이트
            log.info("실시간 통계를 위해 GitHub에서 최신 데이터를 가져옵니다.");
            return contributionService.saveContributions(name)
                .doOnNext(savedContributions -> {
                    log.info("통계용 GitHub 데이터 {}개를 처리했습니다", savedContributions.size());
                })
                .then(contributionService.getContributionsByNickname(name));
        })
        .map(this::calculateStats)
        .map(stats -> ResponseEntity.ok().body(Map.of(
            "success", true,
            "data", stats
        )))
        .onErrorReturn(ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "error", "사용자 통계를 불러올 수 없습니다."
        )));
    }

    /**
     * 사용자 기여 이력 조회 (History 탭용)
     */
    @GetMapping("/history/{nickname}")
    public Mono<ResponseEntity<Map<String, Object>>> getUserHistory(@PathVariable String nickname) {
        // 사용자 존재 확인 및 없으면 생성
        return Mono.fromCallable(() -> {
            Optional<UserDTO> userOpt = userService.findByUsername(nickname);
            if (userOpt.isEmpty()) {
                log.warn("기여 이력 조회 - 사용자를 찾을 수 없어서 기본 사용자 생성: {}", nickname);
                createDefaultUser(nickname);
                return nickname;
            } else {
                return nickname;
            }
        })
        .flatMap(contributionService::getContributionsByNickname)
        .flatMap(_ -> {
            // 매번 GitHub에서 최신 데이터를 가져와서 업데이트
            return contributionService.saveContributions(nickname)
                .then(contributionService.getContributionsByNickname(nickname));
        })
        .map(history -> ResponseEntity.ok().body(Map.of(
            "success", true,
            "data", history
        )))
        .onErrorReturn(ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "error", "기여 이력을 불러올 수 없습니다."
        )));
    }

    /**
     * 사용자 레벨 및 경험치 조회
     */
    @GetMapping("/level/{nickname}")
    public ResponseEntity<Map<String, Object>> getUserLevel(@PathVariable String nickname) {
        try {
            log.info("사용자 레벨 조회 요청: {}", nickname);
            
            Optional<UserDTO> userOpt = userService.findByUsername(nickname);
            UserDTO user;
            
            if (userOpt.isEmpty()) {
                log.warn("사용자를 찾을 수 없습니다: {}", nickname);
                
                // 사용자가 없을 경우 기본 사용자 생성
                user = createDefaultUser(nickname);
                log.info("기본 사용자 생성됨: {}", user.getNickname());
            } else {
                user = userOpt.get();
                log.info("기존 사용자 조회 성공: {}", user.getNickname());
            }

            Map<String, Object> levelInfo = new HashMap<>();
            levelInfo.put("level", user.getLevel());
            levelInfo.put("totalScore", user.getTotalScore());
            levelInfo.put("nickname", user.getNickname());
            levelInfo.put("avatarUrl", user.getAvatarUrl());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", levelInfo
            ));
        } catch (Exception e) {
            log.error("사용자 레벨 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "레벨 정보를 불러올 수 없습니다."
            ));
        }
    }

    /**
     * 기본 사용자 생성
     */
    private UserDTO createDefaultUser(String nickname) {
        try {
            UserDTO newUser = UserDTO.builder()
                    .nickname(nickname)
                    .level(1)
                    .totalScore(0)
                    .build();
            
            return userService.save(newUser);
        } catch (Exception e) {
            log.error("기본 사용자 생성 실패: {}", e.getMessage(), e);
            // 생성에 실패하면 메모리상의 기본 객체 반환
            return UserDTO.builder()
                    .nickname(nickname)
                    .level(1)
                    .totalScore(0)
                    .build();
        }
    }

    /**
     * 기여 데이터를 기반으로 통계 계산
     */
    private Map<String, Object> calculateStats(Map<LocalDate, List<ContributionDTO>> contributionsByDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // 최근 30일간의 기여 통계 계산
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        
        int monthlyPR = 0;
        int monthlyIssue = 0;
        int monthlyCommit = 0;
        int totalScore = 0;

        for (Map.Entry<LocalDate, List<ContributionDTO>> entry : contributionsByDate.entrySet()) {
            LocalDate date = entry.getKey();
            List<ContributionDTO> contributions = entry.getValue();
            
            if (date.isAfter(thirtyDaysAgo)) {
                for (ContributionDTO contribution : contributions) {
                    switch (contribution.getReferenceType()) {
                        case PR:
                            monthlyPR++;
                            if (contribution.getState() == CONTRIBUTION_TYPE.MERGED) {
                                totalScore += 20; // PR merge: 20점
                            }
                            break;
                        case ISSUE:
                            monthlyIssue++;
                            totalScore += 10; // Issue: 10점
                            break;
                        case REVIEW:
                            totalScore += 5; // Review: 5점
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        // 커밋 수는 PR 수를 기반으로 추정 (실제 커밋 데이터는 저장하지 않음)
        monthlyCommit = (int) (monthlyPR * 1.5); // PR 수의 1.5배로 추정

        stats.put("monthlyPR", monthlyPR);
        stats.put("monthlyIssue", monthlyIssue);
        stats.put("monthlyCommit", monthlyCommit);
        stats.put("totalScore", totalScore);

        return stats;
    }
}
