package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.REFERENCE_TYPE;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.ContributionRepository;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.UserRepository;
import com.ossdoctor.config.GithubApiProperties;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class ContributionService {

    private final WebClient webClient;
    private final GithubApiProperties properties;

    private final ContributionRepository contributionRepository;
    private final UserRepository userRepository;
    private final RepositoryRepository  repositoryRepository;

    private final UserService userService;
    private final GitHubApiService  gitHubApiService;
    private final PullRequestService pullRequestService;
    private final IssueService issueService;

    private Optional<ContributionDTO> findLatestByUserId(Long userId) {
        return contributionRepository.findTopByUserIdxOrderByContributedAtDesc(userId).map(this::toDTO);
    }

    private List<ContributionDTO> findByUserIdxAndContributedAtAfter(String owner, LocalDateTime since) {
        return contributionRepository.findByUser_NicknameAndContributedAtAfter(owner, since).stream()
                .map(this::toDTO)  // Entity -> DTO 변환
                .toList();         // Stream -> List
    }


    private ContributionDTO save(ContributionDTO contributionDTO) {
        return toDTO(contributionRepository.save(toEntity(contributionDTO)));
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

    /*public Mono<String> getContributionOnLogin(String owner) {
        Optional<UserDTO> userOpt = userService.findByUsername(owner);

        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", owner);
            return Mono.empty();
        }

        UserDTO user = userOpt.get();
        Optional<ContributionDTO> latestOpt = findLatestByUserId(user.getIdx());

        LocalDateTime since;

        if (latestOpt.isPresent()) {
            // 기존 데이터 있음 → 최신 contributedAt 이후부터 가져오기
            since = latestOpt.get().getContributedAt().plusDays(1);
            log.info("Fetching contributions for {} since last saved date: {}", owner, since);
        } else {
            // 최초 로그인 → joinedAt 기준으로 30일 전부터 가져오기
            since = user.getJoinedAt().minusDays(30);
            log.info("First login for {}, fetching contributions since joinAt-30d: {}", owner, since);
        }

        LocalDateTime since = LocalDateTime.now().minusDays(30);
        return gitHubApiService.getContributionSince(owner, since)
                .flatMap(result -> {
                    // 받은 기여 데이터 저장 로직
                    //save();
                    return Mono.just("Contribution fetched and saved for " + owner);
                });
    }*/

    /*public Mono<List<ContributionDTO>> fetchAndSaveContributions(String owner) {

        LocalDateTime since = LocalDateTime.now().minusDays(30);

        Flux<ContributionDTO> prFlux = gitHubApiService.getPullRequests(owner, since)
                .flatMap(prDTO -> Mono.fromCallable(() -> pullRequestService.save(prDTO))
                        .subscribeOn(Schedulers.boundedElastic())
                        .flatMap(savedPR -> {
                            ContributionDTO contribution = ContributionDTO.builder()
                                    .referenceType(REFERENCE_TYPE.PR)
                                    .referenceId(savedPR.getIdx())
                                    .userId(savedPR.getUserId())
                                    .repositoryId(savedPR.getRepositoryId())
                                    .contributedAt(savedPR.getCreatedAt())
                                    .description(savedPR.getTitle())
                                    .build();
                            // Contribution 테이블에 저장
                            return Mono.fromCallable(() -> save(contribution))
                                    .subscribeOn(Schedulers.boundedElastic());
                        })
                );

        Flux<ContributionDTO> issueFlux = gitHubApiService.getIssues(owner, since)
                .flatMap(issueDTO -> Mono.fromCallable(() -> issueService.save(issueDTO))
                        .subscribeOn(Schedulers.boundedElastic())
                        .flatMap(savedIssue -> {
                            ContributionDTO contribution = ContributionDTO.builder()
                                    .referenceType(REFERENCE_TYPE.ISSUE)
                                    .referenceId(savedIssue.getIdx())
                                    .userId(savedIssue.getUserId())
                                    .repositoryId(savedIssue.getRepositoryId())
                                    .contributedAt(savedIssue.getCreatedAt())
                                    .description(savedIssue.getTitle())
                                    .build();
                            // Contribution 테이블에 저장
                            return Mono.fromCallable(() -> save(contribution))
                                    .subscribeOn(Schedulers.boundedElastic());
                        })
                );

        return Flux.concat(prFlux, issueFlux)
                .collectList();
    }*/

    public Mono<List<ContributionDTO>> saveContributions(String owner) {

        LocalDateTime since;

        // 원래 유저 조회
        // final UserDTO user = userService.findByUsername(owner)
        //         .orElseThrow(() -> new RuntimeException("User not found"));

        // 임시로 기본 닉네임 사용
        final UserDTO user = userService.findByUsername(owner)
                .orElseGet(() -> userService.findByUsername("dabbun")
                        .orElseThrow(() -> new RuntimeException("Default user 'dabbun' not found")));

        Optional<ContributionDTO> latestOpt = findLatestByUserId(user.getIdx());

        if (latestOpt.isPresent()) {
            // 기존 데이터 있음 → 최신 contributedAt 이후부터 가져오기
            since = latestOpt.get().getContributedAt().plusSeconds(1);
            log.info("Fetching contributions for {} since last saved date: {}", owner, since);
        } else {
            // 최초 로그인 → joinedAt 기준으로 30일 전부터 가져오기
            since = user.getJoinedAt().minusDays(30);
            log.info("First login for {}, fetching contributions since joinAt-30d: {}", owner, since);
        }

        return gitHubApiService.getContributionSince(owner, since)
                .flatMapMany(Flux::fromIterable) // List<ContributionDTO> -> Flux<ContributionDTO>
                .map(dto -> {
                    dto.setUserId(user.getIdx()); // user 주입
                    return dto;
                })
                .map(this::save) // DTO -> Entity -> 저장 -> DTO 반환
                .collectList();   // Mono<List<ContributionDTO>> 반환
    }


    public Mono<Map<REFERENCE_TYPE, Long>> getContributionCountsLastMonth(String owner) {
        return Mono.justOrEmpty(userService.findByUsername(owner))
                .flatMapMany(user -> {
                    LocalDateTime since = LocalDateTime.now().minusMonths(1);
                    // 닉네임으로 조회하는 Repository 메서드 사용
                    List<ContributionDTO> contributions = findByUserIdxAndContributedAtAfter(owner, since);
                    return Flux.fromIterable(contributions);
                })
                .collect(Collectors.groupingBy(
                        ContributionDTO::getReferenceType,
                        Collectors.counting()
                ));
    }

}
