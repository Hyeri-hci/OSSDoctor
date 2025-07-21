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
public class UpcyclingRecommendationDTO {
    private Long idx;
    private String name;
    private String url;
    private String language;
    private int star;
    private LocalDateTime lastCommittedAt;
    private String license;
}
