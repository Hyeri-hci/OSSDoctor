package com.ossdoctor.Service;

import com.ossdoctor.DTO.CommitDTO;
import com.ossdoctor.Entity.CommitEntity;
import com.ossdoctor.Repository.CommitRepository;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CommitService {

    private final CommitRepository commitRepository;
    private final RepositoryRepository repositoryRepository;
    private final UserRepository userRepository;

    private CommitDTO save(CommitDTO dto) {
        return toDTO(commitRepository.save(toEntity(dto)));
    }

    private CommitDTO toDTO(CommitEntity entity) {
        return CommitDTO.builder()
                .idx(entity.getIdx())
                .repositoryId(entity.getIdx())
                .userId(entity.getIdx())
                .sha(entity.getSha())
                .message(entity.getMessage())
                .committedAt(entity.getCommitedAt())
                .build();
    }

    private CommitEntity toEntity(CommitDTO dto) {
        return CommitEntity.builder()
                .repository(repositoryRepository.findById(dto.getRepositoryId()).get())
                .user(userRepository.findById(dto.getUserId()).get())
                .sha(dto.getSha())
                .message(dto.getMessage())
                .commitedAt(dto.getCommittedAt())
                .build();
    }
}
