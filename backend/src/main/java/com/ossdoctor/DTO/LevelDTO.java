package com.ossdoctor.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LevelDTO {
    private Long idx;
    private Long levelId;
    private String title;
    private int requiredExp;
}
