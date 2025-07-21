package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "issue")
@Entity
public class IssueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id", nullable = false)
    private RepositoryEntity repository;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private UserEntity user;

    @Column(name = "issue_number", nullable = false)
    private Integer issueNumber;

    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private ISSUE_STATE state;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "closed_at", nullable = true)
    private LocalDateTime closedAt;
}
