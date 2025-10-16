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
public class NpmDependencyParser implements DependencyParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 NPM package.json 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        try {
            JsonNode root = objectMapper.readTree(fileContent);
            AtomicInteger depsCount = new AtomicInteger();
            AtomicInteger peerDepsCount = new AtomicInteger();

            // dependencies 파싱
            JsonNode deps = root.get("dependencies");
            if (deps != null) {
                log.info("🔍 NPM dependencies 섹션에서 {}개 패키지 발견", deps.size());

                deps.fields().forEachRemaining(entry -> {
                    String packageName = entry.getKey();
                    String version = cleanVersion(entry.getValue().asText());

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
                    depsCount.incrementAndGet();

                    if (vendor != null) {
                        log.info("✅ NPM 스코프 패키지 추가: @{}:{} ({})", vendor, product, version);
                    } else {
                        log.info("✅ NPM 일반 패키지 추가: {} ({})", product, version);
                    }
                });
            } else {
                log.warn("⚠️ NPM dependencies 섹션이 없음");
            }

            // peerDependencies도 포함 (선택적)
            JsonNode peerDeps = root.get("peerDependencies");
            if (peerDeps != null) {
                log.info("🔍 NPM peerDependencies 섹션에서 {}개 패키지 발견", peerDeps.size());

                peerDeps.fields().forEachRemaining(entry -> {
                    String packageName = entry.getKey();
                    String version = cleanVersion(entry.getValue().asText());

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
                    peerDepsCount.incrementAndGet();
                    log.info("✅ NPM Peer 의존성 추가: {}:{} ({})", vendor, product, version);
                });
            }

            log.info("🎯 NPM 파싱 완료: dependencies {}개, peerDependencies {}개, 총 {}개",
                    depsCount.get(), peerDepsCount.get(), dependencies.size());

        } catch (Exception e) {
            log.error("💥 NPM package.json 파싱 실패: {}", e.getMessage(), e);
        }

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "package.json".equals(fileName);
    }

    private String[] parsePackageName(String packageName) {
        // @scope/package 형태 처리
        if (packageName.startsWith("@")) {
            int slashIndex = packageName.indexOf("/");
            if (slashIndex > 0) {
                return new String[]{
                        packageName.substring(1, slashIndex), // vendor (@ 제거)
                        packageName.substring(slashIndex + 1)  // product
                };
            }
        }

        // 일반 패키지
        return new String[]{null, packageName};
    }

    private String cleanVersion(String version) {
        if (version == null) return null;
        String cleaned = version.replaceAll("^[\\^~><>=]+", "");
        if (!cleaned.equals(version)) {
            log.debug("🔧 NPM 버전 정규화: {} -> {}", version, cleaned);
        }
        return cleaned;
    }
}
