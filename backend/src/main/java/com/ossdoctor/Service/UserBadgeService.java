package com.ossdoctor.Service;

import com.ossdoctor.DTO.UserBadgeDTO;
import com.ossdoctor.Entity.UserBadgeEntity;
import com.ossdoctor.Repository.BadgeRepository;
import com.ossdoctor.Repository.UserBadgeRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;

    private UserBadgeDTO toDTO(UserBadgeEntity entity){
        return UserBadgeDTO.builder()
                .idx(entity.getIdx())
                .userId(entity.getUser().getIdx())
                .badgeId(entity.getBadge().getIdx())
                .awardedAt(entity.getAwardedAt())
                .build();
    }

    private UserBadgeEntity toEntity(UserBadgeDTO dto){
        return UserBadgeEntity.builder()
                .user(userRepository.findById(dto.getUserId()).get())
                .badge(badgeRepository.findById(dto.getBadgeId()).get())
                .build();
    }
}
