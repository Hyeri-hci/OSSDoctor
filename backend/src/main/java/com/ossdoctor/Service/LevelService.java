package com.ossdoctor.Service;

import com.ossdoctor.DTO.LevelDTO;
import com.ossdoctor.Entity.LevelEntity;
import com.ossdoctor.Repository.LevelRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.logging.Level;

@Service
@AllArgsConstructor
public class LevelService {

    private LevelRepository levelRepository;

    public boolean existsByLevelId(Long levelId){
        return levelRepository.existsById(levelId);
    }

    public LevelDTO findTopByRequiredExpLessThanEqualOrderByLevelIdDesc(Integer requiredExp){
        return toDTO(levelRepository.findTopByRequiredExpLessThanEqualOrderByLevelIdDesc(requiredExp));
    }

    public LevelDTO save(LevelDTO levelDTO) {
        return toDTO(levelRepository.save(toEntity(levelDTO)));
    }

    private LevelDTO toDTO(LevelEntity entity) {
        return LevelDTO.builder()
                .idx(entity.getIdx())
                .levelId(entity.getLevelId())
                .title(entity.getTitle())
                .requiredExp(entity.getRequiredExp())
                .build();
    }

    private LevelEntity toEntity(LevelDTO dto) {
        return LevelEntity.builder()
                .levelId(dto.getLevelId())
                .title(dto.getTitle())
                .requiredExp(dto.getRequiredExp())
                .build();
    }
}
