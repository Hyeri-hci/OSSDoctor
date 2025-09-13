package com.ossdoctor.Service;

import com.ossdoctor.DTO.BadgeDTO;
import com.ossdoctor.Entity.BADGE_CATEGORY;
import com.ossdoctor.Entity.BadgeEntity;
import com.ossdoctor.Repository.BadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public boolean existsByName(String name){
        return badgeRepository.existsByName(name);
    }

    public BadgeDTO save(BadgeDTO badgeDTO) {
        return toDto(badgeRepository.save(toEntity(badgeDTO)));
    }

    private BadgeDTO toDto(BadgeEntity entity) {
        return BadgeDTO.builder()
                .idx(entity.getIdx())
                .name(entity.getName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .level(entity.getLevel())
                .requirement(entity.getRequirement())
                .build();
    }

    private BadgeEntity toEntity(BadgeDTO dto) {
        return BadgeEntity.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .level(dto.getLevel())
                .requirement(dto.getRequirement())
                .build();
    }


}
