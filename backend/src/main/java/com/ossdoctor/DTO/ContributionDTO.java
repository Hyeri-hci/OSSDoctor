package com.ossdoctor.DTO;

import com.ossdoctor.Entity.REFERENCE_TYPE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionDTO {
    private Long idx;
    private Long repositoryId;
    private Long userId;
    private REFERENCE_TYPE referenceType;
    private Long referenceId;
    private LocalDateTime contributedAt;
    private String description;
}
