package com.ossdoctor.DTO;

import com.ossdoctor.Entity.SOURCE_TYPE;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryDTO {
    private Long idx;
    private Long githubRepoId;
    private String name;
    private String description;
    private String url;
    private String owner;
    private String language;
    private SOURCE_TYPE sourceType;
    private String license;
    private int star;
    private int fork;
    private int watchers;
    private int contributors; // 주요 기여자 수 (최대 9명)
    private int totalContributors; // 총 기여자 수
    private Long viewCount;
    private int totalCommits;
    private int openPullRequests;
    private int closedPullRequests;
    private int mergedPullRequests;
    private int totalPullRequests;
    private int openIssues;
    private int closedIssues;
    private int totalIssues;
    private LocalDate lastUpdatedAt;
    private LocalDate lastCommitedAt;

    private List<String> topics;
}