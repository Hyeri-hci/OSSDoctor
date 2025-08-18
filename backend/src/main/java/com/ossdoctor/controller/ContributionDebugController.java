package com.ossdoctor.controller;

import com.ossdoctor.DTO.ContributionDTO;
import com.ossdoctor.Service.ContributionService;
import com.ossdoctor.Service.GitHubApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ContributionDebugController {

    private final ContributionService contributionService;
    private final GitHubApiService gitHubApiService;

    /**
     * 특정 유저(owner)의 GitHub 기여 데이터를 가져와 Mono<String>으로 반환
     */
    @GetMapping("/debug/contribution/{owner}")
    public Mono<List<ContributionDTO>> getContributionDebug(@PathVariable String owner) {
        return contributionService.saveContributions(owner)
                .doOnSubscribe(sub -> System.out.println("GitHub API 호출 시작: " + owner))
                .doOnNext(result -> System.out.println("GitHub API 결과: " + result))
                .doOnError(err -> System.err.println("GitHub API 호출 에러: " + err.getMessage()));
    }

    @GetMapping("/count/{owner}")
    public Mono<Map<LocalDate, List<ContributionDTO>>> getCount(@PathVariable String owner) {
        return contributionService.getContributionsByNickname(owner);
    }

}
