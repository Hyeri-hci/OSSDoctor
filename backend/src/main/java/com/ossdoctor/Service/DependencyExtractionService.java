package com.ossdoctor.Service;

import com.ossdoctor.parser.DependencyParser;
import com.ossdoctor.DTO.GithubTreeNodeDTO;
import com.ossdoctor.DTO.CpeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
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

    public List<CpeDTO> extractDependencies(String repositoryUrl) {
        try {
            // 1. URL 파싱
            String[] parts = parseRepositoryUrl(repositoryUrl);
            String owner = parts[0];
            String repo = parts[1];

            // 2. 리포지토리 전체 파일 리스트 조회
            List<GithubTreeNodeDTO> treeNodes = gitHubTreeApiService.getRepositoryTree(owner, repo);
            List<CpeDTO> allDependencies = new ArrayList<>();

            // 3. 각 파일 탐색 및 필터링
            for (GithubTreeNodeDTO node : treeNodes) {
                if (!"blob".equals(node.getType())) {
                    continue;
                }

                String path = node.getPath();
                String fileName = Paths.get(path).getFileName().toString();

                if (isExcludedPath(path)) {
                    continue;
                }

                if (excludeFiles.contains(fileName)) {
                    continue;
                }

                // 4. 파서 찾기 및 의존성 추출
                DependencyParser parser = findParser(fileName);
                if (parser != null) {
                    try {
                        String fileContent = gitHubTreeApiService.getFileContent(owner, repo, path);
                        List<CpeDTO> dependencies = parser.parseDependencies(fileContent);
                        allDependencies.addAll(dependencies);
                        log.info("{}에서 {}개의 의존성 발견", path, dependencies.size());
                    } catch (Exception e) {
                        log.warn("파일 {} 파싱 실패: {}", path, e.getMessage());
                    }
                }
            }

            // 5. 중복 제거 후 반환
            return removeDuplicates(allDependencies);

        } catch (IllegalArgumentException e) {
            log.error("잘못된 리포지토리 URL: {}", repositoryUrl);
            throw e;
        } catch (Exception e) {
            log.error("의존성 추출 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("의존성 추출 실패", e);
        }
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
