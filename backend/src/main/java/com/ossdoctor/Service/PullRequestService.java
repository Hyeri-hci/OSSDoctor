package com.ossdoctor.Service;

import com.ossdoctor.DTO.PullRequestDTO;
import com.ossdoctor.Entity.PullRequestEntity;
import com.ossdoctor.Repository.PullRequestRepository;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PullRequestService {

    private final PullRequestRepository pullRequestRepository;
    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;

    private PullRequestDTO save(PullRequestDTO pullRequestDTO) {
        return toDTO(pullRequestRepository.save(toEntity(pullRequestDTO)));
    }

    private PullRequestDTO toDTO(PullRequestEntity entity) {
        return PullRequestDTO.builder()
                .idx(entity.getIdx())
                .repositoryId(entity.getRepository().getIdx())
                .userId(entity.getUser().getIdx())
                .prNumber(entity.getPrNumber())
                .title(entity.getTitle())
                .state(entity.getState())
                .createdAt(entity.getCreatedAt())
                .mergedAt(entity.getMergedAt())
                .build();
    }

    private PullRequestEntity toEntity(PullRequestDTO dto) {
        return PullRequestEntity.builder()
                .repository(repositoryRepository.findById(dto.getRepositoryId()).get())
                .user(userRepository.findById(dto.getUserId()).get())
                .prNumber(dto.getPrNumber())
                .title(dto.getTitle())
                .state(dto.getState())
                .createdAt(dto.getCreatedAt())
                .mergedAt(dto.getMergedAt())
                .build();
    }
}
