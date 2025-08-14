package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_ranking")
@Entity
public class UserRankingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "period", nullable = false)
    private PERIOD period;

    @Column(nullable = false)
    private Integer rank;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "calculated_at", nullable = false)
    private LocalDate  calculatedAt;
}
