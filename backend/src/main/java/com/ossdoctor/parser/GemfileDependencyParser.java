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
public class GemfileDependencyParser implements DependencyParser {

    private static final Pattern GEM_PATTERN = Pattern.compile(
            "gem\\s+['\"]([^'\"]+)['\"](?:\\s*,\\s*['\"]([^'\"]+)['\"])?"
    );

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 Ruby Gemfile 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        String[] lines = fileContent.split("\n");
        int skippedLines = 0;
        int devGroupSkipped = 0;
        int processedGems = 0;

        for (String line : lines) {
            line = line.trim();

            // 주석이나 빈 줄, group 블록 내 개발용 gem 제외
            if (line.isEmpty() || line.startsWith("#") || isInDevGroup(line)) {
                if (isInDevGroup(line)) {
                    devGroupSkipped++;
                    log.debug("❌ Ruby 개발 그룹 gem 제외: {}", line);
                } else {
                    skippedLines++;
                }
                continue;
            }

            Matcher matcher = GEM_PATTERN.matcher(line);
            if (matcher.find()) {
                String gemName = matcher.group(1);
                String version = matcher.group(2);

                if (version != null) {
                    version = cleanVersion(version);
                }

                CpeDTO cpe = CpeDTO.builder()
                        .part(null)
                        .vendor("ruby")
                        .product(gemName)
                        .version(version)
                        .build();

                dependencies.add(cpe);
                processedGems++;
                log.info("✅ Ruby Gem 추가: {} ({})",
                        gemName, version != null ? version : "버전 미지정");
            } else {
                log.debug("⚠️ Ruby gem 패턴과 매치되지 않는 라인: {}", line);
            }
        }

        log.info("🎯 Ruby 파싱 완료: 처리된 gem {}개, 건너뛴 라인 {}개, 제외된 개발 gem {}개, 총 {}개 의존성",
                processedGems, skippedLines, devGroupSkipped, dependencies.size());

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "Gemfile".equals(fileName);
    }

    private boolean isInDevGroup(String line) {
        return line.contains("group :development") ||
                line.contains("group :test") ||
                line.contains("group [:development, :test]");
    }

    private String cleanVersion(String version) {
        if (version == null) return null;
        String cleaned = version.replaceAll("^[~>=<]+\\s*", "");
        if (!cleaned.equals(version)) {
            log.debug("🔧 Ruby 버전 정규화: {} -> {}", version, cleaned);
        }
        return cleaned;
    }
}