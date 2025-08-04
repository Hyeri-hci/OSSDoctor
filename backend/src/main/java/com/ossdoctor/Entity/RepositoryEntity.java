package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "repository")
@Entity
public class RepositoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubRepoId;

    @Column(length = 100, nullable = false)
    private String name;

    private String description;

    @Column(length = 255, nullable = false)
    private String url;

    @Column(length = 50, nullable = false)
    private String owner;

    @Column(length = 50, nullable = false)
    private String language;

    @Column(name = "source_type")
    @Enumerated(value = EnumType.STRING)
    private SOURCE_TYPE sourceType;

    @Column(length = 50)
    private String license;

    @Column(nullable = false)
    private Integer star = 0;

    @Column(nullable = false)
    private Integer fork = 0;

    @Column(nullable = false)
    private Integer watchers = 0;

    @Column(nullable = false)
    private Integer contributors = 0;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "merged_pr_count", nullable = false)
    private Integer mergedPullRequests = 0;

    @Column(name = "total_pr_count", nullable = false)
    private Integer totalPullRequests = 0;

    @Column(name = "closed_issue_count", nullable = false)
    private Integer closedIssues = 0;

    @Column(name = "total_issue_count", nullable = false)
    private Integer totalIssues = 0;

    @Column(name = "last_updated_at")
    private LocalDate lastUpdatedAt;

    @Column(name = "last_commited_at")
    private LocalDate lastCommitedAt;

    @ToString.Exclude
    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TopicEntity> topics = new ArrayList<>();
}
