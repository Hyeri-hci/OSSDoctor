package com.ossdoctor.Service;

import com.ossdoctor.DTO.IssueDTO;
import com.ossdoctor.Entity.IssueEntity;
import com.ossdoctor.Repository.IssueRepository;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;

    private IssueDTO save(IssueDTO issueDTO) {
        return toDTO(issueRepository.save(toEntity(issueDTO)));
    }

    private IssueDTO toDTO(IssueEntity entity) {
        return IssueDTO.builder()
                .idx(entity.getIdx())
                .repositoryId(entity.getRepository().getIdx())
                .userId(entity.getUser().getIdx())
                .issueNumber(entity.getIssueNumber())
                .title(entity.getTitle())
                .state(entity.getState())
                .createdAt(entity.getCreatedAt())
                .closedAt(entity.getClosedAt())
                .build();
    }

    private IssueEntity toEntity(IssueDTO dto) {
        return IssueEntity.builder()
                .repository(repositoryRepository.findById(dto.getRepositoryId()).get())
                .user(userRepository.findById(dto.getUserId()).get())
                .issueNumber(dto.getIssueNumber())
                .title(dto.getTitle())
                .state(dto.getState())
                .createdAt(dto.getCreatedAt())
                .closedAt(dto.getClosedAt())
                .build();
    }
}
