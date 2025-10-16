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
public class GoModDependencyParser implements DependencyParser {

    private static final Pattern REQUIRE_PATTERN = Pattern.compile(
            "^\\s*([^\\s]+)\\s+v([0-9\\.]+(?:-[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*)?).*$"
    );

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 Go go.mod 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        String[] lines = fileContent.split("\n");
        boolean inRequireBlock = false;
        int requireBlockCount = 0;
        int singleLineCount = 0;

        for (String line : lines) {
            line = line.trim();

            if (line.equals("require (")) {
                inRequireBlock = true;
                log.debug("🔍 Go require 블록 시작");
                continue;
            }

            if (inRequireBlock && line.equals(")")) {
                inRequireBlock = false;
                log.debug("🔍 Go require 블록 종료");
                continue;
            }

            if (inRequireBlock || line.startsWith("require ")) {
                Matcher matcher = REQUIRE_PATTERN.matcher(line.replace("require ", ""));
                if (matcher.find()) {
                    String modulePath = matcher.group(1);
                    String version = matcher.group(2);

                    String[] parts = parseModulePath(modulePath);
                    String vendor = parts[0];
                    String product = parts[1];

                    CpeDTO cpe = CpeDTO.builder()
                            .part(null)
                            .vendor(vendor)
                            .product(product)
                            .version(version)
                            .build();

                    dependencies.add(cpe);

                    if (inRequireBlock) {
                        requireBlockCount++;
                        log.info("✅ Go 모듈 추가 (블록): {} v{}", modulePath, version);
                    } else {
                        singleLineCount++;
                        log.info("✅ Go 모듈 추가 (단일 라인): {} v{}", modulePath, version);
                    }
                } else {
                    log.debug("⚠️ Go 파싱 실패한 라인: {}", line);
                }
            }
        }

        log.info("🎯 Go 파싱 완료: 블록 형태 {}개, 단일 라인 {}개, 총 {}개 의존성",
                requireBlockCount, singleLineCount, dependencies.size());

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "go.mod".equals(fileName);
    }

    private String[] parseModulePath(String modulePath) {
        // github.com/user/repo 형태
        String[] parts = modulePath.split("/");
        if (parts.length >= 3 && parts[0].contains(".")) {
            log.debug("🔧 Go 모듈 경로 파싱: {} -> vendor: {}, product: {}",
                    modulePath, parts[1], parts[2]);
            return new String[]{parts[1], parts[2]};
        }

        // 단순 모듈명
        log.debug("🔧 Go 단순 모듈명: {}", modulePath);
        return new String[]{null, modulePath};
    }
}
