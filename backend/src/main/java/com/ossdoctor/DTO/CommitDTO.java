package com.ossdoctor.DTO;

import com.ossdoctor.Entity.RepositoryEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitDTO {
    private Long idx;
    private Long repositoryId;
    private Long userId;
    private String sha;
    private String message;
    private LocalDateTime committedAt;
}
