/*
package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class GradleDependencyParser implements DependencyParser {

    // Gradle 의존성 패턴들
    private static final Pattern DEPENDENCY_PATTERN = Pattern.compile(
            "(implementation|api|compile)\\s+['\"]([^:]+):([^:]+):([^'\"]+)['\"]"
    );

    private static final Pattern DEPENDENCY_CLOSURE_PATTERN = Pattern.compile(
            "(implementation|api|compile)\\s+group:\\s*['\"]([^'\"]+)['\"],\\s*name:\\s*['\"]([^'\"]+)['\"],\\s*version:\\s*['\"]([^'\"]+)['\"]"
    );

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        // 한 줄 형태의 의존성 파싱
        Matcher matcher = DEPENDENCY_PATTERN.matcher(fileContent);
        while (matcher.find()) {
            String scope = matcher.group(1);
            String groupId = matcher.group(2);
            String artifactId = matcher.group(3);
            String version = matcher.group(4);

            // testImplementation, debugImplementation 등 제외
            if (scope.contains("test") || scope.contains("debug") || scope.contains("androidTest")) {
                continue;
            }

            CpeDTO cpe = CpeDTO.builder()
                    .part("a")
                    .vendor(groupId)
                    .product(artifactId)
                    .version(version)
                    .build();

            dependencies.add(cpe);
        }

        // 클로저 형태의 의존성 파싱
        Matcher closureMatcher = DEPENDENCY_CLOSURE_PATTERN.matcher(fileContent);
        while (closureMatcher.find()) {
            String scope = closureMatcher.group(1);
            String groupId = closureMatcher.group(2);
            String artifactId = closureMatcher.group(3);
            String version = closureMatcher.group(4);

            if (scope.contains("test") || scope.contains("debug") || scope.contains("androidTest")) {
                continue;
            }

            CpeDTO cpe = CpeDTO.builder()
                    .part("a")
                    .vendor(groupId)
                    .product(artifactId)
                    .version(version)
                    .build();

            dependencies.add(cpe);
        }

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "build.gradle".equals(fileName) || "build.gradle.kts".equals(fileName);
    }
}
 */
package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
/*
@Component
@Slf4j
public class GradleDependencyParser implements DependencyParser {

    // Gradle 의존성 패턴들
    private static final Pattern DEPENDENCY_PATTERN = Pattern.compile(
            "(implementation|api|compile)\\s+['\"]([^:]+):([^:]+):([^'\"]+)['\"]"
    );

    private static final Pattern DEPENDENCY_CLOSURE_PATTERN = Pattern.compile(
            "(implementation|api|compile)\\s+group:\\s*['\"]([^'\"]+)['\"],\\s*name:\\s*['\"]([^'\"]+)['\"],\\s*version:\\s*['\"]([^'\"]+)['\"]"
    );

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 Gradle build.gradle 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        int shortFormCount = 0;
        int closureFormCount = 0;

        // 한 줄 형태의 의존성 파싱
        Matcher matcher = DEPENDENCY_PATTERN.matcher(fileContent);
        while (matcher.find()) {
            String scope = matcher.group(1);
            String groupId = matcher.group(2);
            String artifactId = matcher.group(3);
            String version = matcher.group(4);

            // testImplementation, debugImplementation 등 제외
            if (scope.contains("test") || scope.contains("debug") || scope.contains("androidTest")) {
                log.debug("❌ Gradle 스코프로 인해 제외: {}:{}:{} (scope: {})",
                        groupId, artifactId, version, scope);
                continue;
            }

            CpeDTO cpe = CpeDTO.builder()
                    .part("a")
                    .vendor(groupId)
                    .product(artifactId)
                    .version(version)
                    .build();

            dependencies.add(cpe);
            shortFormCount++;
            log.info("✅ Gradle 의존성 추가 (짧은 형태): {}:{}:{}",
                    cpe.getVendor(), cpe.getProduct(), cpe.getVersion());
        }

        // 클로저 형태의 의존성 파싱
        Matcher closureMatcher = DEPENDENCY_CLOSURE_PATTERN.matcher(fileContent);
        while (closureMatcher.find()) {
            String scope = closureMatcher.group(1);
            String groupId = closureMatcher.group(2);
            String artifactId = closureMatcher.group(3);
            String version = closureMatcher.group(4);

            if (scope.contains("test") || scope.contains("debug") || scope.contains("androidTest")) {
                log.debug("❌ Gradle 스코프로 인해 제외: {}:{}:{} (scope: {})",
                        groupId, artifactId, version, scope);
                continue;
            }

            CpeDTO cpe = CpeDTO.builder()
                    .part("a")
                    .vendor(groupId)
                    .product(artifactId)
                    .version(version)
                    .build();

            dependencies.add(cpe);
            closureFormCount++;
            log.info("✅ Gradle 의존성 추가 (클로저 형태): {}:{}:{}",
                    cpe.getVendor(), cpe.getProduct(), cpe.getVersion());
        }

        log.info("🎯 Gradle 파싱 완료: 짧은 형태 {}개, 클로저 형태 {}개, 총 {}개 의존성",
                shortFormCount, closureFormCount, dependencies.size());

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "build.gradle".equals(fileName) || "build.gradle.kts".equals(fileName);
    }
}


 */
@Component
@Slf4j
public class GradleDependencyParser implements DependencyParser {

    // 기존 패턴들
    private static final Pattern DEPENDENCY_PATTERN = Pattern.compile(
            "(implementation|api|compile|testImplementation|androidTestImplementation)\\s+['\"]([^:]+):([^:]+):([^'\"]+)['\"]"
    );

    // ✅ 새로 추가할 패턴들
    private static final Pattern VERSION_CATALOG_PATTERN = Pattern.compile(
            "(implementation|api|compile|testImplementation|androidTestImplementation)\\s*\\(\\s*libs\\.([^)]+)\\s*\\)"
    );

    private static final Pattern PROJECT_DEPENDENCY_PATTERN = Pattern.compile(
            "(implementation|api|compile)\\s*\\(\\s*project\\s*\\(['\"]([^'\"]+)['\"]\\)\\s*\\)"
    );

    // 플러그인 패턴
    private static final Pattern PLUGIN_PATTERN = Pattern.compile(
            "id\\s*\\(['\"]([^'\"]+)['\"]\\)\\s*version\\s*['\"]([^'\"]+)['\"]"
    );

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 Gradle build.gradle.kts 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        int directDepsCount = 0;
        int catalogDepsCount = 0;
        int projectDepsCount = 0;
        int pluginsCount = 0;

        // 1. 직접 선언된 의존성 파싱
        Matcher directMatcher = DEPENDENCY_PATTERN.matcher(fileContent);
        while (directMatcher.find()) {
            String scope = directMatcher.group(1);
            String groupId = directMatcher.group(2);
            String artifactId = directMatcher.group(3);
            String version = directMatcher.group(4);

            if (isTestScope(scope)) {
                log.debug("❌ Gradle 테스트 스코프로 인해 제외: {}:{}:{}", groupId, artifactId, version);
                continue;
            }

            CpeDTO cpe = CpeDTO.builder()
                    .part(null)
                    .vendor(groupId)
                    .product(artifactId)
                    .version(version)
                    .build();

            dependencies.add(cpe);
            directDepsCount++;
            log.info("✅ Gradle 직접 의존성 추가: {}:{}:{}", groupId, artifactId, version);
        }

        // 2. Version Catalog 의존성 감지 (버전 정보 없이)
        Matcher catalogMatcher = VERSION_CATALOG_PATTERN.matcher(fileContent);
        while (catalogMatcher.find()) {
            String scope = catalogMatcher.group(1);
            String catalogRef = catalogMatcher.group(2);

            if (isTestScope(scope)) {
                continue;
            }

            // Version Catalog 참조를 그룹:아티팩트로 변환 시도
            String[] parts = parseCatalogReference(catalogRef);
            if (parts != null) {
                CpeDTO cpe = CpeDTO.builder()
                        .part(null)
                        .vendor(parts[0])
                        .product(parts[1])
                        .version(null) // Version catalog에서는 버전 정보를 알 수 없음
                        .build();

                dependencies.add(cpe);
                catalogDepsCount++;
                log.info("✅ Gradle 카탈로그 의존성 감지: {} ({})", catalogRef, parts[0] + ":" + parts[1]);
            }
        }

        // 3. 프로젝트 의존성 감지
        Matcher projectMatcher = PROJECT_DEPENDENCY_PATTERN.matcher(fileContent);
        while (projectMatcher.find()) {
            String projectPath = projectMatcher.group(2);
            projectDepsCount++;
            log.info("✅ Gradle 프로젝트 의존성 감지: {}", projectPath);
        }

        // 4. 플러그인 의존성 감지
        Matcher pluginMatcher = PLUGIN_PATTERN.matcher(fileContent);
        while (pluginMatcher.find()) {
            String pluginId = pluginMatcher.group(1);
            String version = pluginMatcher.group(2);

            // 플러그인을 의존성으로 취급
            String[] parts = parsePluginId(pluginId);
            CpeDTO cpe = CpeDTO.builder()
                    .part(null)
                    .vendor(parts[0])
                    .product(parts[1])
                    .version(version)
                    .build();

            dependencies.add(cpe);
            pluginsCount++;
            log.info("✅ Gradle 플러그인 추가: {}:{} ({})", parts[0], parts[1], version);
        }

        log.info("🎯 Gradle 파싱 완료: 직접 의존성 {}개, 카탈로그 의존성 {}개, 프로젝트 의존성 {}개, 플러그인 {}개, 총 {}개",
                directDepsCount, catalogDepsCount, projectDepsCount, pluginsCount, dependencies.size());

        return dependencies;
    }

    private boolean isTestScope(String scope) {
        return scope.contains("test") || scope.contains("debug") ||
                scope.contains("androidTest") || scope.equals("lintChecks");
    }

    private String[] parseCatalogReference(String catalogRef) {
        // libs.androidx.fragment.ktx -> androidx:fragment-ktx 변환 시도
        if (catalogRef.startsWith("androidx.")) {
            String artifact = catalogRef.substring("androidx.".length()).replace(".", "-");
            return new String[]{"androidx", artifact};
        } else if (catalogRef.startsWith("kotlin.")) {
            String artifact = catalogRef.substring("kotlin.".length()).replace(".", "-");
            return new String[]{"org.jetbrains.kotlin", artifact};
        } else if (catalogRef.startsWith("google.")) {
            String artifact = catalogRef.substring("google.".length()).replace(".", "-");
            return new String[]{"com.google", artifact};
        }

        // 기본적으로 첫 번째 부분을 vendor로, 나머지를 product로 사용
        String[] parts = catalogRef.split("\\.", 2);
        if (parts.length == 2) {
            return new String[]{parts[0], parts[1].replace(".", "-")};
        }

        return new String[]{"unknown", catalogRef};
    }

    private String[] parsePluginId(String pluginId) {
        // com.android.application -> com.android:application
        String[] parts = pluginId.split("\\.", 2);
        if (parts.length >= 2) {
            int lastDot = pluginId.lastIndexOf('.');
            String vendor = pluginId.substring(0, lastDot);
            String product = pluginId.substring(lastDot + 1);
            return new String[]{vendor, product};
        }

        return new String[]{"plugin", pluginId};
    }

    @Override
    public boolean supports(String fileName) {
        return "build.gradle".equals(fileName) ||
                "build.gradle.kts".equals(fileName) ||
                fileName.endsWith(".gradle") ||
                fileName.endsWith(".gradle.kts");
    }
}
