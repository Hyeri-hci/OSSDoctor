package com.ossdoctor.controller;

import com.ossdoctor.Service.GitHubApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/debug")
@RequiredArgsConstructor
public class DebugController {

    @Value("${github.token}")
    private String githubToken;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    private final Environment environment; // 애플리케이션 환경설정 값

    @GetMapping("/config")
    public Map<String, Object> checkConfig() {
        Map<String, Object> result = new HashMap<>();

        // 프로파일 확인
        result.put("activeProfiles", Arrays.toString(environment.getActiveProfiles()));

        // 토큰 상태 확인 (보안상 일부만 표시)
        String tokenStatus = githubToken.startsWith("ghp_") ?
                "Real token (ghp_***)" :
                "Default/Missing (" + githubToken + ")";
        result.put("tokenStatus", tokenStatus);

        // 설정 파일 로드 확인
        result.put("configSources", getConfigSources());

        return result;
    }

    private List<String> getConfigSources() {
        // 로드된 설정 파일들 확인
        return Arrays.asList(
                environment.getProperty("spring.config.name", "application") + ".yaml",
                "application-" + activeProfile + ".yaml"
        );
    }

    private final GitHubApiService gitHubApiService;

    @GetMapping("/github/graphql")
    public Mono<String> checkGitHubGraphQL() {
        return gitHubApiService.runSimpleQuery();
    }

    @GetMapping(value = "/{owner}/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<String> getRepository(
            @PathVariable String owner,
            @PathVariable String name) {
        return gitHubApiService.runRepositoryQuery(owner, name);
    }
}