package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class PythonDependencyParser implements DependencyParser {

    // requirements.txt 패턴
    private static final Pattern REQUIREMENTS_PATTERN = Pattern.compile(
            "^([a-zA-Z0-9\\-_\\.]+)(?:[>=<~!]+([0-9\\.]+[a-zA-Z0-9\\-\\.]*))?.*$"
    );

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 Python requirements.txt 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        String[] lines = fileContent.split("\n");
        log.info("🔍 Python 파일에서 총 {}개 라인 발견", lines.length);

        int processedLines = 0;
        int skippedLines = 0;
        int devPackagesSkipped = 0;

        for (String line : lines) {
            line = line.trim();

            // 주석이나 빈 줄 건너뛰기
            if (line.isEmpty() || line.startsWith("#") || line.startsWith("-")) {
                skippedLines++;
                log.debug("⏭️ Python 라인 건너뛰기: {}",
                        line.length() > 50 ? line.substring(0, 50) + "..." : line);
                continue;
            }

            Matcher matcher = REQUIREMENTS_PATTERN.matcher(line);
            if (matcher.find()) {
                String packageName = matcher.group(1);
                String version = matcher.group(2);

                // 개발용 패키지 제외
                if (isDevPackage(packageName)) {
                    devPackagesSkipped++;
                    log.debug("❌ Python 개발용 패키지 제외: {}", packageName);
                    continue;
                }

                CpeDTO cpe = CpeDTO.builder()
                        .part(null)
                        .vendor("python")
                        .product(packageName.toLowerCase())
                        .version(version)
                        .build();

                dependencies.add(cpe);
                processedLines++;
                log.info("✅ Python 패키지 추가: {} ({})",
                        packageName, version != null ? version : "버전 미지정");
            } else {
                log.debug("⚠️ Python 파싱 실패한 라인: {}", line);
            }
        }

        log.info("🎯 Python 파싱 완료: 처리된 라인 {}개, 건너뛴 라인 {}개, 제외된 개발 패키지 {}개, 총 {}개 의존성",
                processedLines, skippedLines, devPackagesSkipped, dependencies.size());

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "requirements.txt".equals(fileName) ||
                "setup.py".equals(fileName) ||
                "pyproject.toml".equals(fileName);
    }

    private boolean isDevPackage(String packageName) {
        String lowerName = packageName.toLowerCase();
        return lowerName.contains("test") ||
                lowerName.contains("dev") ||
                lowerName.contains("debug") ||
                lowerName.equals("pytest") ||
                lowerName.equals("flake8") ||
                lowerName.equals("black");
    }
}
