
package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
/*
@Service
public class GitHubDependencyService {

    private static final String GITHUB_API_URL = "https://api.github.com";
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    private final String githubToken;

    private static final String[] DEP_FILES = {
            "package.json", "package-lock.json", "yarn.lock",
            "pom.xml", "build.gradle", "build.gradle.kts",
            "requirements.txt", "pyproject.toml",
            ".github/workflows"
    };

    public GitHubDependencyService(@Value("${GITHUB_TOKEN}") String githubToken) {
        this.githubToken = githubToken;
    }

    public Map<String, List<String>> fetchDependencies(String owner, String repo, String branch) throws IOException {
        Map<String, List<String>> result = new LinkedHashMap<>();

        // 1. 전체 repository tree 조회
        String treeUrl = GITHUB_API_URL + "/repos/" + owner + "/" + repo + "/git/trees/" + branch + "?recursive=1";
        Request treeRequest = new Request.Builder()
                .url(treeUrl)
                .addHeader("Authorization", "token " + githubToken)
                .addHeader("Accept", "application/vnd.github.v3+json")
                .build();

        try (Response response = client.newCall(treeRequest).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("GitHub API error: " + response);
            }

            String body = response.body().string();
            JsonNode treeJson = mapper.readTree(body).path("tree");

            for (JsonNode node : treeJson) {
                String path = node.get("path").asText();
                String type = node.get("type").asText();

                if ("blob".equals(type) && isDependencyFile(path)) {
                    String content = fetchFileContent(owner, repo, path, branch);
                    List<String> dependencies = parseDependencies(path, content);
                    if (!dependencies.isEmpty()) {
                        result.put(path, dependencies);
                    }
                }
            }
        }

        return result;
    }

    private boolean isDependencyFile(String path) {
        for (String depFile : DEP_FILES) {
            if (path.endsWith(depFile) || path.contains(depFile)) return true;
        }
        return false;
    }

    private String fetchFileContent(String owner, String repo, String path, String branch) throws IOException {
        String url = GITHUB_API_URL + "/repos/" + owner + "/" + repo + "/contents/" + path + "?ref=" + branch;

        Request req = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "token " + githubToken)
                .addHeader("Accept", "application/vnd.github.v3.raw")
                .build();

        try (Response response = client.newCall(req).execute()) {
            if (!response.isSuccessful()) return "";
            return response.body().string();
        }
    }

    private List<String> parseDependencies(String filePath, String content) throws IOException {
        List<String> deps = new ArrayList<>();

        if (filePath.endsWith("package.json")) {
            // Node.js 패키지
            JsonNode json = mapper.readTree(content);
            JsonNode dependencies = json.path("dependencies");
            dependencies.fields().forEachRemaining(e -> deps.add(e.getKey() + "@" + e.getValue().asText()));
            JsonNode devDeps = json.path("devDependencies");
            devDeps.fields().forEachRemaining(e -> deps.add(e.getKey() + "@" + e.getValue().asText()));
        } else if (filePath.endsWith(".gradle") || filePath.endsWith(".gradle.kts")) {
            // Gradle
            Pattern p = Pattern.compile("(implementation|api|compile)\\(['\"](.*?)['\"]\\)");
            Matcher m = p.matcher(content);
            while (m.find()) {
                deps.add(m.group(2));
            }
        } else if (filePath.endsWith("pom.xml")) {
            // Maven
            Pattern p = Pattern.compile("<dependency>\\s*<groupId>(.*?)</groupId>\\s*<artifactId>(.*?)</artifactId>\\s*<version>(.*?)</version>", Pattern.DOTALL);
            Matcher m = p.matcher(content);
            while (m.find()) {
                deps.add(m.group(1) + ":" + m.group(2) + ":" + m.group(3));
            }
        } else if (filePath.endsWith("requirements.txt")) {
            // Python
            String[] lines = content.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("#")) deps.add(line);
            }
        } else if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
            // GitHub Actions
            Pattern p = Pattern.compile("uses:\\s*([\\w\\-./]+)@([\\w.*\\-]+)");
            Matcher m = p.matcher(content);
            while (m.find()) {
                deps.add(m.group(1) + "@" + m.group(2));
            }
        }

        return deps;
    }
}
 *//*
package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
*/
@Service
public class GitHubDependencyService {

    private static final String GITHUB_API_URL = "https://api.github.com";
    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();
    private final String githubToken;

    // 워크플로우 관련 파일 제거
    private static final String[] DEP_FILES = {
            "package.json", "package-lock.json", "yarn.lock",
            "pom.xml", "build.gradle", "build.gradle.kts",
            "requirements.txt", "pyproject.toml"
    };

    public GitHubDependencyService(@Value("${GITHUB_TOKEN}") String githubToken) {
        this.githubToken = githubToken;
    }

    public Map<String, List<String>> fetchDependencies(String owner, String repo, String branch) throws IOException {
        Map<String, List<String>> result = new LinkedHashMap<>();

        String treeUrl = GITHUB_API_URL + "/repos/" + owner + "/" + repo + "/git/trees/" + branch + "?recursive=1";
        Request treeRequest = new Request.Builder()
                .url(treeUrl)
                .addHeader("Authorization", "token " + githubToken)
                .addHeader("Accept", "application/vnd.github.v3+json")
                .build();

        try (Response response = client.newCall(treeRequest).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("GitHub API error: " + response);
            }

            String body = response.body().string();
            JsonNode treeJson = mapper.readTree(body).path("tree");

            for (JsonNode node : treeJson) {
                String path = node.get("path").asText();
                String type = node.get("type").asText();

                // GitHub Actions 워크플로우 파일은 무시
                if (path.startsWith(".github/workflows/")) {
                    continue;
                }

                if ("blob".equals(type) && isDependencyFile(path)) {
                    String content = fetchFileContent(owner, repo, path, branch);
                    List<String> dependencies = parseDependencies(path, content);
                    if (!dependencies.isEmpty()) {
                        result.put(path, dependencies);
                    }
                }
            }
        }

        return result;
    }

    private boolean isDependencyFile(String path) {
        // 워크플로우 파일 재검사
        if (path.startsWith(".github/workflows/")) {
            return false;
        }
        for (String depFile : DEP_FILES) {
            if (path.endsWith(depFile) || path.contains(depFile)) {
                return true;
            }
        }
        return false;
    }

    private String fetchFileContent(String owner, String repo, String path, String branch) throws IOException {
        String url = GITHUB_API_URL + "/repos/" + owner + "/" + repo + "/contents/" + path + "?ref=" + branch;
        Request req = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "token " + githubToken)
                .addHeader("Accept", "application/vnd.github.v3.raw")
                .build();

        try (Response response = client.newCall(req).execute()) {
            if (!response.isSuccessful()) return "";
            return response.body().string();
        }
    }

    private List<String> parseDependencies(String filePath, String content) throws IOException {
        List<String> deps = new ArrayList<>();

        if (filePath.endsWith("package.json")) {
            JsonNode json = mapper.readTree(content);
            JsonNode dependencies = json.path("dependencies");
            dependencies.fields().forEachRemaining(e -> deps.add(e.getKey() + "@" + e.getValue().asText()));
            // devDependencies는 제외
        } else if (filePath.endsWith(".gradle") || filePath.endsWith(".gradle.kts")) {
            Pattern p = Pattern.compile("(implementation|api|compile)\\(['\"](.*?)['\"]\\)");
            Matcher m = p.matcher(content);
            while (m.find()) {
                deps.add(m.group(2));
            }
        } else if (filePath.endsWith("pom.xml")) {
            Pattern p = Pattern.compile(
                    "<dependency>\\s*<groupId>(.*?)</groupId>\\s*<artifactId>(.*?)</artifactId>\\s*<version>(.*?)</version>",
                    Pattern.DOTALL
            );
            Matcher m = p.matcher(content);
            while (m.find()) {
                deps.add(m.group(1) + ":" + m.group(2) + ":" + m.group(3));
            }
        } else if (filePath.endsWith("requirements.txt")) {
            String[] lines = content.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (!line.isEmpty() && !line.startsWith("#")) {
                    deps.add(line);
                }
            }
        }

        return deps;
    }
}
