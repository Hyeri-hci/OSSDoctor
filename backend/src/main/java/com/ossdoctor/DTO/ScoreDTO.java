package com.ossdoctor.DTO;

import com.ossdoctor.Entity.SCORE_TYPE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoreDTO {
    private Long idx;
    private Long repositoryId;
    private SCORE_TYPE scoreType;
    private int score;
    private LocalDateTime createdAt;
}
