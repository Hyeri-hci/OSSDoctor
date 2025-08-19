package com.ossdoctor.Service;

import com.ossdoctor.DTO.ActivityDTO;
import com.ossdoctor.Entity.*;
import com.ossdoctor.Repository.IssueRepository;
import com.ossdoctor.Repository.PullRequestRepository;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class ActivityService {

    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;
    private final IssueRepository issueRepository;
    private final PullRequestRepository pullRequestRepository;

    public Mono<List<ActivityDTO>> saveActivities(List<ActivityDTO> activities, Long repositoryId) {
        List<Mono<Void>> tasks = new ArrayList<>(); // 비동기 저장 작업

        // DTO 순회하면서 저장
        for (ActivityDTO dto : activities) {
            if (dto.getType().startsWith("pr_")) { // PR
                tasks.add(savePRAsync(dto, repositoryId));
            } else if (dto.getType().startsWith("issue_")) { // Issue
                tasks.add(saveIssueAsync(dto, repositoryId));
            }
        }

        // Flux.merge(): 여러 비동기 작업을 동시에 병렬로 실행
        // .then(): 모든 작업이 끝나면 완료신호 보냄
        // 리턴 값은 없음 => 신호만
        return Flux.merge(tasks).then(Mono.just(activities));
    }

    private Mono<Void> saveIssueAsync(ActivityDTO dto, Long repositoryId) {
        // 동기식 -> 비동기식
        return Mono.fromCallable(() -> {
            // RepositoryEntity 가지고옴 (Id 기준)
            RepositoryEntity repository = repositoryRepository.findByGithubRepoId(repositoryId)
                    // 못찾으면 예외발생 -> 로그
                    .orElseThrow(() -> new IllegalArgumentException("Repository not found: id=" + repositoryId));
            UserEntity user = userRepository.findByNickname(dto.getAuthor()).orElse(null);

            IssueEntity issue = IssueEntity.builder()
                    .repository(repository)
                    .user(user)
                    .userName(dto.getAuthor())
                    .issueNumber(dto.getNumber())
                    .title(dto.getTitle())
                    .state(dto.getType().equals("issue_opened") ? ISSUE_STATE.OPEN : ISSUE_STATE.CLOSED)
                    .createdAt(parseDate(dto.getStartDate()))
                    .closedAt(dto.getType().equals("issue_closed") ? parseDate(dto.getEndDate()) : null)
                    .build();

            issueRepository.save(issue);
            return null;
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    private Mono<Void> savePRAsync(ActivityDTO dto, Long repositoryId) {
        return Mono.fromCallable(() -> {
            RepositoryEntity repository = repositoryRepository.findByGithubRepoId(repositoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Repository not found: id=" + repositoryId));
            UserEntity user = userRepository.findByNickname(dto.getAuthor()).orElse(null);

            PullRequestEntity pr = PullRequestEntity.builder()
                    .repository(repository)
                    .user(user)
                    .userName(dto.getAuthor())
                    .prNumber(dto.getNumber())
                    .title(dto.getTitle())
                    .state(mapPRState(dto.getType()))
                    .createdAt(parseDate(dto.getStartDate()))
                    .mergedAt(dto.getType().equals("pr_merged") ? parseDate(dto.getEndDate()) : null)
                    .build();

            pullRequestRepository.save(pr);
            return null;
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }

    private PR_STATE mapPRState(String type) {
        return switch (type) {
            case "pr_opened" -> PR_STATE.OPEN;
            case "pr_closed" -> PR_STATE.CLOSED;
            case "pr_merged" -> PR_STATE.MERGED;
            default -> throw new IllegalArgumentException("invalid PR type");
        };
    }

    private LocalDateTime parseDate(String isoDateTime) {
        if (isoDateTime == null || isoDateTime.equalsIgnoreCase("null") || isoDateTime.isBlank()) {
            return null;
        }

        try {
            return LocalDateTime.parse(isoDateTime, DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException e) {
            log.info("날짜 파싱 실패: {}", isoDateTime);
            return null;
        }
    }

}
