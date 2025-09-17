package com.ossdoctor.Service;

import com.ossdoctor.DTO.BadgeDTO;
import com.ossdoctor.DTO.UserBadgeDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.BADGE_CATEGORY;
import com.ossdoctor.Entity.BadgeEntity;
import com.ossdoctor.Entity.UserBadgeEntity;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.BadgeRepository;
import com.ossdoctor.Repository.UserBadgeRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserBadgeService {

    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserService userService;

    public boolean existsByUserIdAndBadgeLevelAndBadgeCategory(Long userId, Integer badgeLevel, BADGE_CATEGORY category) {
        return userBadgeRepository.existsByUserIdAndBadgeLevelAndBadgeCategory(userId, badgeLevel, category);
    }

    public UserBadgeDTO save(UserBadgeDTO badgeDTO) {return toDTO(userBadgeRepository.save(toEntity(badgeDTO)));}

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

    // 사용자별 획득한 뱃지 가져오기
    public Mono<List<UserBadgeDTO>> getBadgesByNickname(String nickname) {
        return Mono.fromCallable(() -> userRepository.findByNickname(nickname)) // 닉네임으로 사용자 찾기
                .subscribeOn(Schedulers.boundedElastic()) // 블로킹 작업을 별도의 쓰레드 풀에서 실행 => 논믈로킹 흐름으로
                .flatMap(user -> {
                    if (user.isEmpty()) { // 사용자가 없으면
                        return Mono.just(Collections.emptyList()); // 비어있는 리스트를 Mono로 감싸서 반환
                    }
                    return Mono.fromCallable(() -> userBadgeRepository.findByUser(user)) // 사용자가 얻은 뱃지 찾기
                            .subscribeOn(Schedulers.boundedElastic())
                            .flatMapMany(Flux::fromIterable) // Mono(하나) -> Flux(여러개)
                            .map(this::toDTO)
                            .collectList();
                });
    }

    // 전체 뱃지 가져오기(획득O + 획득X)
    public Mono<List<BadgeDTO>> getAllBadgesWithEarned(String nickname) {
        return getBadgesByNickname(nickname) // 사용자 획득 뱃지 가져오기
                .flatMap(userBadgeDTO ->
                        Mono.fromCallable(badgeRepository::findAll) // 전체 뱃지 가져오기
                                .subscribeOn(Schedulers.boundedElastic())
                                .map(badges -> {
                                    List<BadgeDTO> result = new ArrayList<>();
                                    for (BadgeEntity badge : badges) {
                                        boolean earned = userBadgeDTO.stream()
                                                // anyMatch: 하나라도 조건이 만족하면 true를 반환
                                                .anyMatch(ub -> ub.getBadgeId().equals(badge.getIdx()));

                                        result.add(BadgeDTO.builder()
                                                .idx(badge.getIdx())
                                                .name(badge.getName())
                                                .description(badge.getDescription())
                                                .category(badge.getCategory())
                                                .level(badge.getLevel())
                                                .requirement(badge.getRequirement())
                                                .earned(earned) // 획득 여부만 체크
                                                .build());
                                    }
                                    return result;
                                })
                );
    }

    // 최근 획득 뱃지(12개)
    public Mono<List<UserBadgeDTO>> getRecentBadges(String nickname) {
        return Mono.justOrEmpty(userService.findByUsername(nickname)) // Optional<UserDTO> → Mono<UserDTO>
                .switchIfEmpty(Mono.error(new RuntimeException("User not found")))
                .flatMap(userDTO ->
                        Mono.fromCallable(() ->
                                userBadgeRepository.findTop12ByUser_IdxOrderByAwardedAtDescIdxAsc(userDTO.getIdx()) // userId 기준 조회
                                        .stream()
                                        .map(this::toDTO)
                                        .toList()
                        ).subscribeOn(Schedulers.boundedElastic())
                );
    }

}
