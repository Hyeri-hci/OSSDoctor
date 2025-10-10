package com.ossdoctor.Service;

import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.Entity.RepositoryEntity;
import com.ossdoctor.Entity.TopicEntity;
import com.ossdoctor.Repository.RepositoryRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;

    @Transactional
    public Optional<RepositoryDTO> findByGithubId(Long githubId) {
        return repositoryRepository.findByGithubRepoId(githubId)
                .map(this::toDTO);
    }

    public RepositoryDTO save(RepositoryDTO dto) {
        return toDTO(repositoryRepository.save(toEntity(dto)));
    }

    public RepositoryDTO toDTO(RepositoryEntity entity) {

        List<String> topics;
        try {
            topics = entity.getTopics() != null ?
                    entity.getTopics().stream()
                            .map(TopicEntity::getTopic)
                            .toList()
                    : new ArrayList<>();
        } catch (Exception e) {
            // LazyInitializationException 발생하면 빈 리스트로 처리
            topics = new ArrayList<>();
        }

        return RepositoryDTO.builder()
                .idx(entity.getIdx())
                .githubRepoId(entity.getGithubRepoId())
                .name(entity.getName())
                .url(entity.getUrl())
                .owner(entity.getOwner())
                .language(entity.getLanguage())
                .license(entity.getLicense())
                .star(entity.getStar())
                .fork(entity.getFork())
                .watchers(entity.getWatchers())
                .contributors(entity.getContributors())
                .totalContributors(entity.getTotalContributors())
                .description(entity.getDescription())
                .totalCommits(entity.getTotalCommits())
                .openPullRequests(entity.getOpenPullRequests())
                .mergedPullRequests(entity.getMergedPullRequests())
                .totalPullRequests(entity.getTotalPullRequests())
                .openIssues(entity.getOpenIssues())
                .closedIssues(entity.getClosedIssues())
                .totalIssues(entity.getTotalIssues())
                .lastUpdatedAt(entity.getLastUpdatedAt())
                .lastCommitedAt(entity.getLastCommitedAt())
                .topics(topics)
                .build();
    }

    public RepositoryEntity toEntity(RepositoryDTO dto) {

        RepositoryEntity entity = RepositoryEntity.builder()
                .idx(dto.getIdx() != null ? dto.getIdx() : null)
                .githubRepoId(dto.getGithubRepoId())
                .name(dto.getName())
                .url(dto.getUrl())
                .owner(dto.getOwner())
                .language(dto.getLanguage())
                .license(dto.getLicense())
                .star(dto.getStar())
                .fork(dto.getFork())
                .watchers(dto.getWatchers())
                .contributors(dto.getContributors())
                .totalContributors(dto.getTotalContributors())
                .description(dto.getDescription())
                .totalCommits(dto.getTotalCommits())
                .openPullRequests(dto.getOpenPullRequests())
                .mergedPullRequests(dto.getMergedPullRequests())
                .totalPullRequests(dto.getTotalPullRequests())
                .openIssues(dto.getOpenIssues())
                .closedIssues(dto.getClosedIssues())
                .totalIssues(dto.getTotalIssues())
                .lastUpdatedAt(dto.getLastUpdatedAt())
                .lastCommitedAt(dto.getLastCommitedAt())
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

    @Transactional
    public RepositoryDTO findByFullName(String owner, String name) {
        log.info("findByFullName");
        return toDTO(repositoryRepository.findByOwnerAndName(owner, name)
                .orElseThrow(() ->
                        new EntityNotFoundException("Repository with name " + name + " not found")));
    }
}
