package com.ossdoctor.Service;

import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO save(UserDTO dto){
        return toDTO(userRepository.save(toEntity(dto)));
    }

    private UserDTO toDTO(UserEntity entity) {
        return UserDTO.builder()
                .idx(entity.getIdx())
                .githubId(entity.getGithubId())
                .nickname(entity.getNickname())
                .avatarUrl(entity.getAvatarUrl())
                .bio(entity.getBio())
                .level(entity.getLevel())
                .totalScore(entity.getTotalScore())
                .joinedAt(entity.getJoinedAt())
                .build();
    }

    private UserEntity toEntity(UserDTO dto) {
        return UserEntity.builder()
                .githubId(dto.getGithubId())
                .nickname(dto.getNickname())
                .avatarUrl(dto.getAvatarUrl())
                .bio(dto.getBio())
                .level(dto.getLevel())
                .totalScore(dto.getTotalScore())
                .build();
    }
}
