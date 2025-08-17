package com.ossdoctor.Entity;

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
@Table(name = "contribution")
@Entity
public class ContributionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "repository_name", length = 100, nullable = false)
    private String repositoryName;

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", nullable = false)
    private REFERENCE_TYPE referenceType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CONTRIBUTION_TYPE state;

    @Column(nullable = false)
    private Integer number;

    @Column(nullable = false)
    private String title;

    @Column(name = "contributed_at", nullable = false)
    private LocalDateTime contributedAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;
}
