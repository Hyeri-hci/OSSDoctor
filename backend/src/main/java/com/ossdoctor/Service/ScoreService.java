package com.ossdoctor.Service;

import com.ossdoctor.Entity.ScoreEntity;
import com.ossdoctor.Repository.ScoreRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;

    // 저장소 ID로 점수 조회 (최소 형태)
    public Map<String, Integer> getScoresByRepositoryId(Long repositoryId) {
        List<ScoreEntity> scores = scoreRepository.findByRepositoryIdx(repositoryId);
        Map<String, Integer> scoreMap = new HashMap<>();
        for (ScoreEntity score : scores) {
            scoreMap.put(score.getScoreType().name().toLowerCase() + "Score", score.getScore());
        }
        return scoreMap;
    }

    // 점수 저장 기능 추가
    public com.ossdoctor.DTO.ScoreDTO save(com.ossdoctor.DTO.ScoreDTO scoreDTO) {
        ScoreEntity scoreEntity = ScoreEntity.builder()
                .repository(com.ossdoctor.Entity.RepositoryEntity.builder().idx(scoreDTO.getRepositoryId()).build())
                .scoreType(scoreDTO.getScoreType())
                .score(scoreDTO.getScore())
                .build();
        ScoreEntity saved = scoreRepository.save(scoreEntity);
        return com.ossdoctor.DTO.ScoreDTO.builder()
                .idx(saved.getIdx())
                .repositoryId(saved.getRepository().getIdx())
                .scoreType(saved.getScoreType())
                .score(saved.getScore())
                .createdAt(saved.getCreatedAt())
                .build();
    }
}
