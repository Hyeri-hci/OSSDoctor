package com.ossdoctor.DTO;

import com.ossdoctor.Entity.ISSUE_STATE;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueDTO {
    private Long idx;
    private Long repositoryId;
    private Long userId;
    private String userName;
    private int issueNumber;
    private String title;
    private ISSUE_STATE state;
    private ZonedDateTime createdAt;
    private ZonedDateTime closedAt;
}
