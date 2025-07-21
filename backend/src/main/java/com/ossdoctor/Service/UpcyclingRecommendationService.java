package com.ossdoctor.Service;

import com.ossdoctor.DTO.UpcyclingRecommendationDTO;
import com.ossdoctor.Entity.UpcyclingRecommendationEntity;
import com.ossdoctor.Repository.UpcyclingRecommendationRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UpcyclingRecommendationService {

    private final UpcyclingRecommendationRepository upcyclingRecommendationRepository;

    private UpcyclingRecommendationDTO save(UpcyclingRecommendationDTO upcyclingRecommendationDTO) {
        return toDTO(upcyclingRecommendationRepository.save(toEntity(upcyclingRecommendationDTO)));
    }

    private UpcyclingRecommendationDTO toDTO(UpcyclingRecommendationEntity entity) {
        return UpcyclingRecommendationDTO.builder()
                .idx(entity.getIdx())
                .name(entity.getName())
                .url(entity.getUrl())
                .language(entity.getLanguage())
                .star(entity.getStar())
                .lastCommittedAt(entity.getLastCommittedAt())
                .license(entity.getLicense())
                .build();
    }

    private UpcyclingRecommendationEntity toEntity(UpcyclingRecommendationDTO dto) {
        return UpcyclingRecommendationEntity.builder()
                .name(dto.getName())
                .url(dto.getUrl())
                .language(dto.getLanguage())
                .star(dto.getStar())
                .lastCommittedAt(dto.getLastCommittedAt())
                .license(dto.getLicense())
                .build();
    }
}
