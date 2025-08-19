package com.ossdoctor.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long idx;
    private Long githubId;
    private String nickname;
    private String avatarUrl;
    private String bio;
    private int level;
    private int totalScore;
    private LocalDateTime joinedAt;
}
