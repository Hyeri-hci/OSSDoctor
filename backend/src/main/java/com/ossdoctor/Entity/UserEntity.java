package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Slf4j
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user")
@Entity
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @Column(name = "github_id", nullable = false, unique = true)
    private Long githubId;

    @Column(length = 50, nullable = false)
    private String nickname;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    private String bio;

    @Column(nullable = false)
    private Integer level = 1;

    @Column(name = "total_score", nullable = false)
    private Integer totalScore = 0;

    @Column(name = "joined_at",  nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    public void prePersist() {
        log.info("prePersist");
        this.joinedAt = LocalDateTime.now();
    }
}
