package com.ossdoctor.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "level")
@Entity
public class LevelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    @Column(name = "level_id", nullable = false)
    private Long levelId;

    @Column(length = 50, nullable = false)
    private String title;

    @Column(name = "required_exp", nullable = false)
    private Integer  requiredExp;
}
