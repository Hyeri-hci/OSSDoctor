package com.ossdoctor.DTO;

import com.ossdoctor.Entity.BADGE_CATEGORY;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeMetricDTO {
    private BADGE_CATEGORY badgeCategory;
    private int count;
}
