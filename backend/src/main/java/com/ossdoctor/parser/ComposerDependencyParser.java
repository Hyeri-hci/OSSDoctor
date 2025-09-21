package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Slf4j
public class ComposerDependencyParser implements DependencyParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 PHP composer.json 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        try {
            JsonNode root = objectMapper.readTree(fileContent);
            JsonNode deps = root.get("require");

            if (deps != null) {
                log.info("🔍 PHP require 섹션에서 {}개 패키지 발견", deps.size());

                AtomicInteger excludedCount = new AtomicInteger();
                AtomicInteger includedCount = new AtomicInteger();

                deps.fields().forEachRemaining(entry -> {
                    String packageName = entry.getKey();
                    String version = cleanVersion(entry.getValue().asText());

                    // php 자체 및 확장 모듈 제외
                    if (packageName.startsWith("php") || packageName.startsWith("ext-")) {
                        excludedCount.incrementAndGet();
                        log.debug("❌ PHP 시스템 패키지 제외: {}", packageName);
                        return;
                    }

                    String[] parts = parsePackageName(packageName);
                    String vendor = parts[0];
                    String product = parts[1];

                    CpeDTO cpe = CpeDTO.builder()
                            .part(null)
                            .vendor(vendor)
                            .product(product)
                            .version(version)
                            .build();

                    dependencies.add(cpe);
                    includedCount.incrementAndGet();

                    if (vendor != null) {
                        log.info("✅ PHP 패키지 추가: {}/{} ({})", vendor, product, version);
                    } else {
                        log.info("✅ PHP 패키지 추가: {} ({})", product, version);
                    }
                });

                log.info("🎯 PHP 파싱 완료: 포함된 패키지 {}개, 제외된 패키지 {}개, 총 {}개 의존성",
                        includedCount.get(), excludedCount.get(), dependencies.size());

            } else {
                log.warn("⚠️ PHP require 섹션이 없음");
            }

        } catch (Exception e) {
            log.error("💥 PHP composer.json 파싱 실패: {}", e.getMessage(), e);
        }

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "composer.json".equals(fileName);
    }

    private String[] parsePackageName(String packageName) {
        String[] parts = packageName.split("/");
        if (parts.length == 2) {
            return new String[]{parts[0], parts[1]};
        }
        return new String[]{null, packageName};
    }

    private String cleanVersion(String version) {
        if (version == null) return null;
        String cleaned = version.replaceAll("^[\\^~><>=]+", "");
        if (!cleaned.equals(version)) {
            log.debug("🔧 PHP 버전 정규화: {} -> {}", version, cleaned);
        }
        return cleaned;
    }
}
