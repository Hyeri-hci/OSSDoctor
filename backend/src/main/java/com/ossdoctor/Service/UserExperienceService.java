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

    @Transactional
    public void addUserExperience(List<ContributionDTO> contributions) {
        if (contributions == null || contributions.isEmpty()) return;
        log.info("contributions: {}", contributions);

        // 첫 번째 DTO의 userId로 User 조회
        UserDTO userDTO = userService.findById(contributions.get(0).getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        int totalExp = 0;
        Set<String> contributedRepos = new HashSet<>();

        // 1. 개별 기여 경험치 계산 및 저장
        for (ContributionDTO dto : contributions) {
            int exp = 0;
            switch (dto.getReferenceType()) {
                case PR:
                    if (dto.getState() == CONTRIBUTION_TYPE.MERGED) exp = 20;
                    break;
                case ISSUE:
                    exp = 10;
                    break;
                case REVIEW:
                    exp = 5;
                    break;
            }

            if (exp > 0) {
                totalExp += exp;
                contributedRepos.add(dto.getRepositoryName());

                UserExperienceDTO experience = UserExperienceDTO.builder()
                        .userId(userDTO.getIdx())
                        .activityId(dto.getIdx()) // Contribution과 연결
                        .experience(exp)
                        .build();

                save(experience);
            }
        }

        // 2. 레포 경험치 저장 (activityId=null)
        for (String repoName : contributedRepos) {
            UserExperienceDTO repoExpDTO = UserExperienceDTO.builder()
                    .userId(userDTO.getIdx())
                    .activityId(null) // 특정 기여와 연결 안 함
                    .experience(50)
                    .build();

            save(repoExpDTO);
            totalExp += 50;
        }

        // 3. 누적 점수 업데이트
        userDTO.setTotalScore(userDTO.getTotalScore() + totalExp);

        // 4. 레벨 계산
        LevelDTO nextLevel = levelService
                .findTopByRequiredExpLessThanEqualOrderByLevelIdDesc(userDTO.getTotalScore());

        if (nextLevel != null && nextLevel.getLevelId() > userDTO.getLevel()) {
            userDTO.setLevel(nextLevel.getLevelId().intValue());
        }

        // 5. User 저장
        userService.save(userDTO);
    }
}

