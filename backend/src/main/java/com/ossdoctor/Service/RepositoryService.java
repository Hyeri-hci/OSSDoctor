package com.ossdoctor.Service;

import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.Entity.RepositoryEntity;
import com.ossdoctor.Repository.RepositoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;

    public RepositoryDTO save(RepositoryDTO dto) {
        return toDTO(repositoryRepository.save(toEntity(dto)));
    }

    private RepositoryDTO toDTO(RepositoryEntity entity) {
        return RepositoryDTO.builder()
                .idx(entity.getIdx())
                .githubRepoId(entity.getGithubRepoId())
                .name(entity.getName())
                .url(entity.getUrl())
                .owner(entity.getOwner())
                .language(entity.getLanguage())
                .sourceType(entity.getSourceType())
                .license(entity.getLicense())
                .star(entity.getStar())
                .fork(entity.getFork())
                .watchers(entity.getWatchers())
                .contributors(entity.getContributors())
                .description(entity.getDescription())
                .viewCount(entity.getViewCount())
                .build();
    }

    private RepositoryEntity toEntity(RepositoryDTO dto) {
        return RepositoryEntity.builder()
                .githubRepoId(dto.getGithubRepoId())
                .name(dto.getName())
                .url(dto.getUrl())
                .owner(dto.getOwner())
                .language(dto.getLanguage())
                .sourceType(dto.getSourceType())
                .license(dto.getLicense())
                .star(dto.getStar())
                .fork(dto.getFork())
                .watchers(dto.getWatchers())
                .contributors(dto.getContributors())
                .description(dto.getDescription())
                .viewCount(dto.getViewCount() != null ? dto.getViewCount() : 0L)
                .build();
    }
}
