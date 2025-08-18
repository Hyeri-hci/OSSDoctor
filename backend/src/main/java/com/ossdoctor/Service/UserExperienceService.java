package com.ossdoctor.Service;

import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.DTO.LevelDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.DTO.UserExperienceDTO;
import com.ossdoctor.Entity.*;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.UserExperienceRepository;
import com.ossdoctor.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class UserExperienceService {

    private final UserExperienceRepository userExperienceRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final LevelService levelService;
    private final ContributionRepository contributionRepository;

    private UserExperienceDTO save(UserExperienceDTO dto) {
        return toDTO(userExperienceRepository.save(toEntity(dto)));
    }

    private UserExperienceDTO toDTO(UserExperienceEntity entity) {
        return UserExperienceDTO.builder()
                .idx(entity.getIdx())
                .userId(entity.getUser().getIdx())
                .activityId(entity.getActivity() != null ? entity.getActivity().getIdx() : null)
                .experience(entity.getExperience())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private UserExperienceEntity toEntity(UserExperienceDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ContributionEntity activity = null;
        if (dto.getActivityId() != null) {
            activity = contributionRepository.findById(dto.getActivityId())
                    .orElseThrow(() -> new RuntimeException("Contribution not found"));
        }

        return UserExperienceEntity.builder()
                .user(user)
                .activity(activity) // null 허용
                .experience(dto.getExperience())
                .build();
    }


    // 기여 내역 받아서 경험치 올리기
    @Transactional
    public void addUserExperience(List<ContributionDTO> contributions) {
        if (contributions == null || contributions.isEmpty()) return;
        log.info("Adding experience for contributions: {}", contributions);

        UserDTO user = userService.findById(contributions.get(0).getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        int totalExp = saveContributionExperience(user, contributions); // 활동 경험치
        totalExp += saveRepositoryExperience(user, contributions); // 저장소 개수 경험치
        updateUserScoreAndLevel(user, totalExp);

        userService.save(user);
    }

    // 경험치 이력 저장
    private int saveContributionExperience(UserDTO user, List<ContributionDTO> contributions) {
        int totalExp = 0;
        for (ContributionDTO dto : contributions) {
            int exp = calculateContributionExp(dto);
            if (exp > 0) {
                totalExp += exp;
                UserExperienceDTO experience = UserExperienceDTO.builder()
                        .userId(user.getIdx())
                        .activityId(dto.getIdx())
                        .experience(exp)
                        .build();
                save(experience);
            }
        }
        return totalExp;
    }

    // 경험치 계산
    private int calculateContributionExp(ContributionDTO dto) {
        switch (dto.getReferenceType()) {
            case PR: return dto.getState() == CONTRIBUTION_TYPE.MERGED ? 20 : 0;
            case ISSUE: return 10;
            case REVIEW: return 5;
            default: return 0;
        }
    }

    // repo당 경험치(50)
    private int saveRepositoryExperience(UserDTO user, List<ContributionDTO> contributions) {
        Set<String> repos = contributions.stream()
                .map(ContributionDTO::getRepositoryName)
                .collect(Collectors.toSet());

        int totalExp = 0;
        for (String repo : repos) {
            UserExperienceDTO repoExp = UserExperienceDTO.builder()
                    .userId(user.getIdx())
                    .activityId(null)
                    .experience(50)
                    .build();
            save(repoExp);
            totalExp += 50;
        }
        return totalExp;
    }

    // 사용자 score와 level 업데이트
    private void updateUserScoreAndLevel(UserDTO user, int totalExp) {
        user.setTotalScore(user.getTotalScore() + totalExp);
        LevelDTO nextLevel = levelService
                .findTopByRequiredExpLessThanEqualOrderByLevelIdDesc(user.getTotalScore());
        if (nextLevel != null && nextLevel.getLevelId() > user.getLevel()) {
            user.setLevel(nextLevel.getLevelId().intValue());
        }
    }
}

