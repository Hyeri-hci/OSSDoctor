package com.ossdoctor.Service;

import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final UserRepository userRepository;
    private final RepositoryRepository  repositoryRepository;

    private ContributionDTO save(ContributionDTO contributionDTO) {
        return toDTO(contributionRepository.save(toEntity(contributionDTO)));
    }

    private ContributionDTO toDTO(ContributionEntity entity) {
        return ContributionDTO.builder()
                .idx(entity.getIdx())
                .userId(entity.getUser().getIdx())
                .repositoryId(entity.getRepository().getIdx())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .contributedAt(entity.getContributedAt())
                .description(entity.getDescription())
                .build();
    }

    private ContributionEntity toEntity(ContributionDTO dto) {
        return ContributionEntity.builder()
                .user(userRepository.findById(dto.getUserId()).get())
                .repository(repositoryRepository.findById(dto.getRepositoryId()).get())
                .referenceType(dto.getReferenceType())
                .referenceId(dto.getReferenceId())
                .contributedAt(dto.getContributedAt())
                .description(dto.getDescription())
                .build();
    }
}
