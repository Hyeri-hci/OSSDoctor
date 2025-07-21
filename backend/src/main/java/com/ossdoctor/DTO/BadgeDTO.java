package com.ossdoctor.DTO;

import com.ossdoctor.Entity.PERIOD;
import com.ossdoctor.Entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private Long idx;
    private String name;
    private String description;
    private String iconUrl;
}
