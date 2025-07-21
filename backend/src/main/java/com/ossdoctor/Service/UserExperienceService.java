package com.ossdoctor.Service;

import com.ossdoctor.DTO.UserExperienceDTO;
import com.ossdoctor.Entity.UserExperienceEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.UserExperienceRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserExperienceService {

    private final UserExperienceRepository userExperienceRepository;
    private final UserRepository userRepository;
    private final ContributionRepository contributionRepository;

    private UserExperienceDTO save(UserExperienceDTO userExperienceDTO) {
        return toDTO(userExperienceRepository.save(toEntity(userExperienceDTO)));
    }

    private UserExperienceDTO toDTO(UserExperienceEntity entity) {
        return UserExperienceDTO.builder()
                .idx(entity.getIdx())
                .userId(entity.getUser().getIdx())
                .activityId(entity.getActivity().getIdx())
                .experience(entity.getExperience())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private UserExperienceEntity toEntity(UserExperienceDTO dto) {
        return UserExperienceEntity.builder()
                .user(userRepository.findById(dto.getUserId()).get())
                .activity(contributionRepository.findById(dto.getActivityId()).get())
                .experience(dto.getExperience())
                .build();
    }
}
