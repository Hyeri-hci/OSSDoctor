package com.ossdoctor.Service;

import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.CONTRIBUTION_TYPE;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.REFERENCE_TYPE;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@AllArgsConstructor
public class ContributionService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final GitHubApiService gitHubApiService;
    private final ContributionRepository contributionRepository;
    private final UserExperienceService userExperienceService;

    // 저장 결과를 담는 클래스
    private static class SaveResult {
        private final ContributionDTO dto;
        private final boolean isNewlySaved;
        
        public SaveResult(ContributionDTO dto, boolean isNewlySaved) {
            this.dto = dto;
            this.isNewlySaved = isNewlySaved;
        }
        
        public ContributionDTO getDto() { return dto; }
        public boolean isNewlySaved() { return isNewlySaved; }
    }
    
    private SaveResult saveWithResult(ContributionDTO dto) {
        // 중복 체크: 실제 엔티티를 조회해서 확인
        Optional<ContributionEntity> existingEntity = contributionRepository
            .findByUserAndRepositoryAndNumberAndReferenceType(
                dto.getUserId(), dto.getRepositoryName(), dto.getNumber(), dto.getReferenceType()
            );
        
        if (existingEntity.isPresent()) {
            return new SaveResult(toDTO(existingEntity.get()), false);
        }
        
        ContributionDTO savedDto = toDTO(contributionRepository.save(toEntity(dto)));
        return new SaveResult(savedDto, true);
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
        // 1. 사용자 조회
        return Mono.justOrEmpty(userService.findByUsername(owner))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("사용자 {}를 찾을 수 없어 dabbun으로 대체 시도", owner);
                    return Mono.justOrEmpty(userService.findByUsername("dabbun"))
                            .switchIfEmpty(Mono.error(new RuntimeException("Default user 'dabbun' not found")));
                }))
                .flatMap(user -> {
                    // 2. 먼저 endAt이 null인 기여 업데이트
                    return updateIncompleteContributions(user)
                            // 업데이트가 끝난 뒤 새로운 기여 가져오기
                            .then(Mono.defer(() -> {
                                log.info("================");
                                ZonedDateTime since = findLatestContribution(user)
                                        .map(latest -> latest.getContributedAt().plusSeconds(1))
                                        .orElse(user.getJoinedAt().minusDays(30));

                                return gitHubApiService.getContributionSince(owner, since)
                                        .doOnError(error -> log.error("GitHub API 호출 실패: {}", error.getMessage()))
                                        .flatMapMany(Flux::fromIterable)
                                        .map(dto -> {
                                            dto.setUserId(user.getIdx());
                                            return dto;
                                        })
                                        .collectList()
                                        .flatMap(dtoList -> Mono.fromCallable(() -> {
                                            // 3. 각 DTO 저장 & 새로 저장된 것 추적
                                            List<SaveResult> saveResults = dtoList.stream()
                                                    .map(this::saveWithResult)
                                                    .toList();

                                            List<ContributionDTO> allSaved = saveResults.stream()
                                                    .map(SaveResult::getDto)
                                                    .collect(Collectors.toList());

                                            List<ContributionDTO> newContributions = saveResults.stream()
                                                    .filter(SaveResult::isNewlySaved)
                                                    .map(SaveResult::getDto)
                                                    .collect(Collectors.toList());

                                            log.info("전체 처리된 기여: {}개, 새로 저장된 기여: {}개",
                                                    allSaved.size(), newContributions.size());

                                            if (!newContributions.isEmpty()) {
                                                userExperienceService.addUserExperience(newContributions);
                                                log.info("{}개의 새로운 기여에 대해 경험치를 부여했습니다", newContributions.size());
                                            } else {
                                                log.info("새로운 기여가 없어 경험치 부여를 건너뜁니다");
                                            }

                                            return allSaved;
                                        }).subscribeOn(Schedulers.boundedElastic()));
                            }));
                });
    }


    public Mono<Void> updateIncompleteContributions(UserDTO user) {
        List<ContributionDTO> contributions = findByUserAndEndAtIsNull(user);
        log.info(contributions.toString());
        if (contributions == null || contributions.isEmpty()) {
            log.info("업데이트할 기여 없음");
            return Mono.fromRunnable(() -> {}).then(); // 빈 경우도 complete 신호 보장
        }

        return Flux.fromIterable(contributions)
                .flatMap(this::updateContributionDtoIfChanged)
                .collectList()
                .doOnNext(updatedContributions -> {
                    List<ContributionDTO> mergedPRs = updatedContributions.stream()
                            .filter(dto -> dto.getReferenceType() == REFERENCE_TYPE.PR &&
                                    dto.getState() == CONTRIBUTION_TYPE.MERGED)
                            .toList();

                    if (!mergedPRs.isEmpty()) {
                        userExperienceService.addUserExperience(mergedPRs);
                        log.info("{}개의 PR이 MERGED 상태로 변경되어 경험치를 부여했습니다", mergedPRs.size());
                    } else {
                        log.info("MERGED된 PR이 없어 경험치 부여를 건너뜁니다");
                    }
                })
                .then();
    }

    // DTO를 받아서 상태가 바뀌었으면 업데이트
    private Mono<ContributionDTO> updateContributionDtoIfChanged(ContributionDTO dto) {
        return getLatestContribution(dto)
                .flatMap(latestDto -> {
                    boolean changed = !latestDto.getState().equals(dto.getState()) ||
                            (latestDto.getEndAt() != null && !latestDto.getEndAt().equals(dto.getEndAt()));

                    return Mono.fromCallable(() -> {
                        if (changed) {
                            // 기존 엔티티 조회
                            Optional<ContributionEntity> entityOpt = contributionRepository
                                    .findByUserAndRepositoryAndNumberAndReferenceType(
                                            dto.getUserId(),
                                            dto.getRepositoryName(),
                                            dto.getNumber(),
                                            dto.getReferenceType()
                                    );

                            ContributionEntity entity;
                            // 없으면 새로 생성
                            entity = entityOpt.orElseGet(() -> toEntity(dto));

                            // 상태 업데이트
                            entity.setState(latestDto.getState());
                            entity.setEndAt(latestDto.getEndAt());

                            // 저장 후 DTO 반환
                            return toDTO(contributionRepository.save(entity));
                        }
                        return dto; // 변경 없으면 그대로
                    }).subscribeOn(Schedulers.boundedElastic());
                })
                .switchIfEmpty(Mono.just(dto)); // getLatestContribution가 empty면 원본 dto 유지
    }

    // 타입별 API 호출
    private Mono<ContributionDTO> getLatestContribution(ContributionDTO dto) {
        if (dto.getRepositoryName() == null || !dto.getRepositoryName().contains("/")) {
            log.warn("Invalid repositoryName format: {}", dto.getRepositoryName());
            return Mono.empty();
        }

        String[] parts = dto.getRepositoryName().split("/");
        String owner = parts[0];
        String repo = parts[1];

        return switch (dto.getReferenceType()) {
            case PR -> gitHubApiService.getPullRequest(owner, repo, dto.getNumber());
            case ISSUE -> gitHubApiService.getIssue(owner, repo, dto.getNumber());
            case REVIEW, COMMIT -> Mono.empty();
        };
    }

    // endAt이 null인 값
    private List<ContributionDTO> findByUserAndEndAtIsNull(UserDTO user) {
        return contributionRepository.findByUserIdxAndEndAtIsNull(user.getIdx())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private Optional<ContributionDTO> findLatestContribution(UserDTO user) {
        return contributionRepository.findTopByUserIdxOrderByContributedAtDesc(user.getIdx())
                .map(this::toDTO);
    }

    // 날짜별 기여 이력 가져오기
    public Mono<Map<LocalDate, List<ContributionDTO>>> getContributionsByNickname(String nickname) {
        return Mono.fromCallable(() -> userRepository.findByNickname(nickname))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(user -> {
                    if (user.isEmpty()) {
                        return Mono.just(Collections.emptyMap());
                    }
                    return Mono.fromCallable(() -> contributionRepository.findByUserOrderByContributedAtDesc(user))
                            .subscribeOn(Schedulers.boundedElastic())
                            .flatMapMany(Flux::fromIterable)
                            .map(this::toDTO)
                            .collectMultimap(dto -> dto.getContributedAt().toLocalDate())
                            .map(map -> {
                                Map<LocalDate, List<ContributionDTO>> result = new TreeMap<>();
                                map.forEach((date, coll) -> result.put(date, new ArrayList<>(coll)));
                                return result;
                            });
                });
    }

}