package com.ossdoctor.Service;

import com.ossdoctor.DTO.ScoreDTO;
import com.ossdoctor.Entity.SCORE_TYPE;
import com.ossdoctor.Entity.ScoreEntity;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.ScoreRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;
    private final RepositoryRepository repositoryRepository;

    private ScoreDTO save(ScoreDTO scoreDTO) {
        return toDTO(scoreRepository.save(toEntity(scoreDTO)));
    }

    private ScoreDTO toDTO(ScoreEntity entity) {
        return ScoreDTO.builder()
                .idx(entity.getIdx())
                .repositoryId(entity.getRepository().getIdx())
                .scoreType(entity.getScoreType())
                .score(entity.getScore())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private ScoreEntity toEntity(ScoreDTO dto) {
        return ScoreEntity.builder()
                .repository(repositoryRepository.findById(dto.getRepositoryId()).get())
                .scoreType(dto.getScoreType())
                .score(dto.getScore())
                .build();
    }
}
