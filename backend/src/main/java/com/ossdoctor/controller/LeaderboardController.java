package com.ossdoctor.controller;

import com.ossdoctor.DTO.LeaderboardUserDTO;
import com.ossdoctor.Service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    /**
     * 기간별 리더보드 조회
     * @param period today(오늘), week(이번주), month(이번달)
     * @param limit 조회할 사용자 수 (기본 10명)
     * @return 리더보드 데이터
     */
    @GetMapping("/{period}")
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @PathVariable String period,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            log.info("리더보드 조회 요청 - 기간: {}, 제한: {}", period, limit);
            
            List<LeaderboardUserDTO> leaderboard = leaderboardService.getLeaderboard(period, limit);
            
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "data", leaderboard,
                    "period", period,
                    "totalCount", leaderboard.size()
            ));
            
        } catch (Exception e) {
            log.error("리더보드 조회 실패 - 기간: {}, 오류: {}", period, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "리더보드 데이터를 불러올 수 없습니다."
            ));
        }
    }

    /**
     * 특정 사용자의 순위 조회
     * @param nickname 사용자 닉네임
     * @param period 기간 (today, week, month)
     * @return 사용자 순위 정보
     */
    @GetMapping("/rank/{nickname}")
    public ResponseEntity<Map<String, Object>> getUserRank(
            @PathVariable String nickname,
            @RequestParam(defaultValue = "today") String period) {
        
        try {
            log.info("사용자 순위 조회 요청 - 닉네임: {}, 기간: {}", nickname, period);
            
            LeaderboardUserDTO userRank = leaderboardService.getUserRank(nickname, period);
            
            if (userRank == null) {
                return ResponseEntity.ok().body(Map.of(
                        "success", false,
                        "message", "사용자를 찾을 수 없습니다."
                ));
            }
            
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "data", userRank,
                    "period", period
            ));
            
        } catch (Exception e) {
            log.error("사용자 순위 조회 실패 - 닉네임: {}, 오류: {}", nickname, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "사용자 순위를 불러올 수 없습니다."
            ));
        }
    }
}