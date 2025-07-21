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
public class UserExperienceDTO {
    private Long idx;
    private Long userId;
    private Long activityId;
    private int experience;
    private LocalDateTime createdAt;
}
