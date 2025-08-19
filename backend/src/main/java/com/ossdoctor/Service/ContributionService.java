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
        return Mono.justOrEmpty(userService.findByUsername(owner))
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("사용자 {}를 찾을 수 없어 dabbun으로 대체 시도", owner);
                    return Mono.justOrEmpty(userService.findByUsername("dabbun")) // 임시
                            .switchIfEmpty(Mono.error(new RuntimeException("Default user 'dabbun' not found")));
                }))
                .flatMap(user -> {
                    LocalDateTime since = findLatestContribution(user)
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
                            .flatMap(dtoList -> {
                                // 각 DTO를 저장하면서 새로 저장된 것들만 별도로 추적
                                List<SaveResult> saveResults = dtoList.stream()
                                    .map(this::saveWithResult)
                                    .collect(java.util.stream.Collectors.toList());
                                
                                List<ContributionDTO> allSaved = saveResults.stream()
                                    .map(SaveResult::getDto)
                                    .collect(java.util.stream.Collectors.toList());
                                    
                                List<ContributionDTO> newContributions = saveResults.stream()
                                    .filter(SaveResult::isNewlySaved)
                                    .map(SaveResult::getDto)
                                    .collect(java.util.stream.Collectors.toList());
                                
                                log.info("전체 처리된 기여: {}개, 새로 저장된 기여: {}개", 
                                    allSaved.size(), newContributions.size());
                                
                                if (!newContributions.isEmpty()) {
                                    userExperienceService.addUserExperience(newContributions);
                                    log.info("{}개의 새로운 기여에 대해 경험치를 부여했습니다", newContributions.size());
                                } else {
                                    log.info("새로운 기여가 없어 경험치 부여를 건너뜁니다");
                                }
                                
                                return Mono.just(allSaved);
                            });
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