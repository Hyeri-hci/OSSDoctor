package com.ossdoctor.DTO;

import com.ossdoctor.Entity.PR_STATE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PullRequestDTO {
    private Long idx;
    private Long repositoryId;
    private Long userId;
    private String userName;
    private int prNumber;
    private String title;
    private PR_STATE state;
    private LocalDateTime createdAt;
    private LocalDateTime mergedAt;
}
