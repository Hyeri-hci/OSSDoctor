package com.ossdoctor.Service;

import com.ossdoctor.parser.DependencyParser;
import com.ossdoctor.DTO.CpeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.*;
import java.nio.file.Paths;

@Service
@Slf4j
public class DependencyExtractionService {
    private final GithubTreeApiService gitHubTreeApiService;
    private final List<DependencyParser> parsers;

    // 분석에서 제외할 디렉토리 목록(CI/CD)
    private final Set<String> excludeDirectories = Set.of(
            ".github", ".gitlab-ci", ".circleci", ".travis",
            "workflows", ".workflows", "ci", ".ci"
    );

    // 분석에서 제외할 파일 목록(개발 의존성 파일)
    private final Set<String> excludeFiles = Set.of(
            "package-lock.json", "yarn.lock", "Pipfile.lock",
            "Gemfile.lock", "composer.lock", "go.sum"
    );

    public DependencyExtractionService(GithubTreeApiService gitHubTreeApiService,
                                       List<DependencyParser> parsers) {
        this.gitHubTreeApiService = gitHubTreeApiService;
        this.parsers = parsers;
    }

    public Flux<CpeDTO> extractDependencies(String owner, String repo) {
        return gitHubTreeApiService.getRepositoryTree(owner, repo)
                .flatMapMany(Flux::fromIterable)
                .filter(node -> "blob".equals(node.getType()))
                .filter(node -> !isExcludedPath(node.getPath()))
                .filter(node -> !excludeFiles.contains(Paths.get(node.getPath()).getFileName().toString()))
                .flatMap(node -> {
                    DependencyParser parser = findParser(Paths.get(node.getPath()).getFileName().toString());
                    if (parser == null) return Flux.empty();
                    return gitHubTreeApiService.getFileContent(owner, repo, node.getPath())
                            .map(parser::parseDependencies)
                            .flatMapMany(Flux::fromIterable)
                            .onErrorResume(e -> {
                                log.warn("파일 {} 파싱 실패 : {}", node.getPath(), e);
                                return Flux.empty();
                            });
                })
                .distinct();
    }

    private boolean isExcludedPath(String path) {
        return excludeDirectories.stream()
                .anyMatch(dir -> path.startsWith(dir + "/") || path.contains("/" + dir + "/"));
    }

    private DependencyParser findParser(String fileName) {
        return parsers.stream()
                .filter(parser -> parser.supports(fileName))
                .findFirst()
                .orElse(null);
    }

    private List<CpeDTO> removeDuplicates(List<CpeDTO> dependencies) {
        Map<String, CpeDTO> uniqueDeps = new LinkedHashMap<>();
        for (CpeDTO dep : dependencies) {
            String key = (dep.getVendor() != null ? dep.getVendor() + ":" : "") + dep.getProduct();
            uniqueDeps.put(key, dep);
        }
        return new ArrayList<>(uniqueDeps.values());
    }

    public String[] parseRepositoryUrl(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Repository URL cannot be null or empty");
        }

        String cleanUrl = repositoryUrl.replaceFirst("https://github.com/", "");

        if (cleanUrl.endsWith(".git")) {
            cleanUrl = cleanUrl.substring(0, cleanUrl.length() - 4);
        }

        String[] urlParts = cleanUrl.split("/");
        if (urlParts.length < 2) {
            throw new IllegalArgumentException("잘못된 GitHub URL 형식: " + repositoryUrl);
        }

        return new String[]{urlParts[0], urlParts[1]};
    }
}
