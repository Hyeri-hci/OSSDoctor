package com.ossdoctor.Service;

import com.ossdoctor.DTO.BadgeDTO;
import com.ossdoctor.Entity.BadgeEntity;
import com.ossdoctor.Repository.BadgeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;

    private BadgeDTO save(BadgeDTO badgeDTO) {
        return toDto(badgeRepository.save(toEntity(badgeDTO)));
    }

    private BadgeDTO toDto(BadgeEntity entity) {
        return BadgeDTO.builder()
                .idx(entity.getIdx())
                .name(entity.getName())
                .description(entity.getDescription())
                .iconUrl(entity.getIconUrl())
                .build();
    }

    private BadgeEntity toEntity(BadgeDTO dto) {
        return BadgeEntity.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .iconUrl(dto.getIconUrl())
                .build();
    }
}
