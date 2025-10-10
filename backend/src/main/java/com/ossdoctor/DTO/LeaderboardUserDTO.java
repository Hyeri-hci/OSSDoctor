package com.ossdoctor.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardUserDTO {
    private Long userId;
    private String username;
    private String nickname;
    private String avatar;
    private Integer totalScore;
    private Integer periodScore; // 기간별 점수
    private Integer prCount;
    private Integer issueCount;
    private Integer commitsCount;
    private Integer reviewCount; // 리뷰 수 추가
    private Integer contributionStreak;
    private ZonedDateTime joinDate;
    private Integer rank; // 순위 (계산된 값)
}