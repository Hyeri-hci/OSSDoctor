package com.ossdoctor.DTO;

import com.ossdoctor.Entity.PERIOD;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankingDTO {
    private Long idx;
    private Long userId;
    private PERIOD period;
    private int score;
    private int rank;
    private LocalDate calculatedAt;
}
