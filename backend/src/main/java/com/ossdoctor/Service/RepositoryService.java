package com.ossdoctor.Service;

import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.Entity.RepositoryEntity;
import com.ossdoctor.Entity.TopicEntity;
import com.ossdoctor.Repository.RepositoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;

    public RepositoryDTO save(RepositoryDTO dto) {
        return toDTO(repositoryRepository.save(toEntity(dto)));
    }

    private RepositoryDTO toDTO(RepositoryEntity entity) {

        List<String> topics = entity.getTopics() != null ?
                entity.getTopics().stream()
                        .map(TopicEntity::getTopic)
                        .toList()
                : new ArrayList<>();

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
                .topics(topics)
                .build();
    }

    private RepositoryEntity toEntity(RepositoryDTO dto) {

        RepositoryEntity entity = RepositoryEntity.builder()
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

        if (dto.getTopics() != null) {
            List<TopicEntity> topicEntities = dto.getTopics().stream()
                    .map(topic -> TopicEntity.builder()
                            .topic(topic)
                            .repository(entity)
                            .build())
                    .toList();
            entity.setTopics(topicEntities);
        }

        return entity;
    }
}
