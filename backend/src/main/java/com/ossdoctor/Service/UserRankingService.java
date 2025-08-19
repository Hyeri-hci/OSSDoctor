package com.ossdoctor.Service;

import com.ossdoctor.DTO.UserRankingDTO;
import com.ossdoctor.Entity.UserRankingEntity;
import com.ossdoctor.Repository.UserRankingRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserRankingService {

    private final UserRankingRepository userRankingRepository;
    private final UserRepository userRepository;

    private UserRankingDTO save(UserRankingDTO userRankingDTO) {
        return toDTO(userRankingRepository.save(toEntity(userRankingDTO)));
    }

    private UserRankingDTO toDTO(UserRankingEntity entity) {
        return UserRankingDTO.builder()
                .idx(entity.getIdx())
                .period(entity.getPeriod())
                .rank(entity.getRank())
                .score(entity.getScore())
                .calculatedAt(entity.getCalculatedAt())
                .build();
    }

    private UserRankingEntity toEntity(UserRankingDTO dto) {
        return UserRankingEntity.builder()
                .user(userRepository.findById(dto.getIdx()).get())
                .period(dto.getPeriod())
                .rank(dto.getRank())
                .score(dto.getScore())
                .calculatedAt(dto.getCalculatedAt())
                .build();
    }
}
