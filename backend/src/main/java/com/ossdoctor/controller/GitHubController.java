package com.ossdoctor.controller;

import com.ossdoctor.service.GitHubDependencyService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
public class GitHubController {

    private final GitHubDependencyService gitHubService;

    public GitHubController(GitHubDependencyService gitHubService) {
        this.gitHubService = gitHubService;
    }

    // 예:
    // GET http://localhost:8080/api/github/dependencies?owner=signalapp&repo=Signal-Desktop&branch=development
    // (branch는 생략 시 main)
    @GetMapping("/dependencies")
    public Map<String, List<String>> getDependencies(
            @RequestParam String owner,
            @RequestParam String repo,
            @RequestParam(defaultValue = "main") String branch
    ) throws IOException {
        Map<String, List<String>> deps = gitHubService.fetchDependencies(owner, repo, branch);

        // 콘솔 출력(디버그용)
        deps.forEach((file, list) -> {
            System.out.println("===== " + file + " =====");
            list.forEach(System.out::println);
            System.out.println();
        });

        return deps;
    }
}
