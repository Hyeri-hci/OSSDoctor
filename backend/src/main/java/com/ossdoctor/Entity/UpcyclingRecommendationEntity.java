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
@Table(name = "upcycling_recommendation")
@Entity
public class UpcyclingRecommendationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @Column(length = 50, nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    @Column(length = 50, nullable = false)
    private String language;

    @Column(nullable = false)
    private Integer star;

    @Column(name = "last_committed_at", nullable = false)
    private LocalDateTime lastCommittedAt;

    @Column(length = 50, nullable = false)
    private String license;
}
