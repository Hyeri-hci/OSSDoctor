package com.ossdoctor.Service;

import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;


@Slf4j
@Service
@AllArgsConstructor
public class ContributionService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final GitHubApiService gitHubApiService;
    private final ContributionRepository contributionRepository;
    private final UserExperienceService userExperienceService;

    private ContributionDTO save(ContributionDTO dto) {
        return toDTO(contributionRepository.save(toEntity(dto)));
    }

    private ContributionDTO toDTO(ContributionEntity entity) {
        return ContributionDTO.builder()
                .idx(entity.getIdx())
                .userId(entity.getUser().getIdx())
                .repositoryName(entity.getRepositoryName())
                .referenceType(entity.getReferenceType())
                .state(entity.getState())
                .title(entity.getTitle())
                .number(entity.getNumber())
                .contributedAt(entity.getContributedAt())
                .endAt(entity.getEndAt())
                .build();
    }

    private ContributionEntity toEntity(ContributionDTO dto) {
        return ContributionEntity.builder()
                .user(userRepository.findById(dto.getUserId()).get())
                .repositoryName(dto.getRepositoryName())
                .referenceType(dto.getReferenceType())
                .state(dto.getState())
                .title(dto.getTitle())
                .number(dto.getNumber())
                .contributedAt(dto.getContributedAt())
                .endAt(dto.getEndAt())
                .build();
    }

    public Mono<List<ContributionDTO>> saveContributions(String owner) {
        return Mono.justOrEmpty(userService.findByUsername(owner))
                .switchIfEmpty(Mono.defer(() ->
                        Mono.justOrEmpty(userService.findByUsername("dabbun")) // 임시
                                .switchIfEmpty(Mono.error(new RuntimeException("Default user 'dabbun' not found")))
                ))
                .flatMap(user -> {
                    LocalDateTime since = findLatestContribution(user)
                            .map(latest -> latest.getContributedAt().plusSeconds(1))
                            .orElse(user.getJoinedAt().minusDays(30));

                    log.info("Fetching contributions for {} since {}", owner, since);

                    return gitHubApiService.getContributionSince(owner, since)
                            .flatMapMany(Flux::fromIterable)
                            .map(dto -> { dto.setUserId(user.getIdx()); return dto; })
                            .map(this::save)
                            .collectList()
                            .doOnSuccess(userExperienceService::addUserExperience);
                });
    }

    private Optional<ContributionDTO> findLatestContribution(UserDTO user) {
        return contributionRepository.findTopByUserIdxOrderByContributedAtDesc(user.getIdx())
                .map(this::toDTO);
    }


    // 날짜별 기여 이력 가져오기
    public Mono<Map<LocalDate, List<ContributionDTO>>> getContributionsByNickname(String nickname) {
        return Mono.fromCallable(() -> userRepository.findByNickname(nickname))
                .subscribeOn(Schedulers.boundedElastic())
                .doOnNext(user -> System.out.println("User found: " + user)) // 유저 조회 로그
                .flatMap(user -> {
                    if (user.isEmpty()) {
                        System.out.println("User not found for nickname: " + nickname);
                        return Mono.just(Collections.emptyMap());
                    }
                    return Mono.fromCallable(() -> contributionRepository.findByUserOrderByContributedAtDesc(user))
                            .subscribeOn(Schedulers.boundedElastic())
                            .flatMapMany(Flux::fromIterable)
                            .map(this::toDTO)
                            .doOnNext(dto -> System.out.println("ContributionDTO: " + dto)) // 각 DTO 로그
                            .collectMultimap(dto -> dto.getContributedAt().toLocalDate())
                            .map(map -> {
                                Map<LocalDate, List<ContributionDTO>> result = new TreeMap<>();
                                map.forEach((date, coll) -> result.put(date, new ArrayList<>(coll)));
                                return result;
                            })
                            .doOnSuccess(res -> System.out.println("Grouped result: " + res)); // 최종 Map 로그
                });
    }

}