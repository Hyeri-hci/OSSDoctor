package com.ossdoctor.DTO;

import com.ossdoctor.Entity.CONTRIBUTION_TYPE;
import com.ossdoctor.Entity.PR_STATE;
import com.ossdoctor.Entity.REFERENCE_TYPE;
import com.ossdoctor.Entity.UserEntity;
import jakarta.persistence.*;
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
    private Long userId;
    private String repositoryName;
    private REFERENCE_TYPE referenceType;
    private CONTRIBUTION_TYPE state;
    private int number;
    private String title;
    private LocalDateTime contributedAt;
    private LocalDateTime endAt;
}
