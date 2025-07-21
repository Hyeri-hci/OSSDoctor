package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

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
}
