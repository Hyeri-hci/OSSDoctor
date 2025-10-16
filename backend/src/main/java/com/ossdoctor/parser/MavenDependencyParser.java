package com.ossdoctor.parser;

import com.ossdoctor.DTO.CpeDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class MavenDependencyParser implements DependencyParser {

    @Override
    public List<CpeDTO> parseDependencies(String fileContent) {
        List<CpeDTO> dependencies = new ArrayList<>();

        log.info("📦 Maven pom.xml 파싱 시작, 파일 크기: {}바이트", fileContent.length());

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(fileContent.getBytes()));

            NodeList dependencyNodes = doc.getElementsByTagName("dependency");
            log.info("🔍 Maven에서 발견된 의존성 노드 수: {}", dependencyNodes.getLength());

            for (int i = 0; i < dependencyNodes.getLength(); i++) {
                Node dependency = dependencyNodes.item(i);
                if (dependency.getNodeType() == Node.ELEMENT_NODE) {
                    Element element = (Element) dependency;

                    String scope = getTextContent(element, "scope");
                    String groupId = getTextContent(element, "groupId");
                    String artifactId = getTextContent(element, "artifactId");
                    String version = getTextContent(element, "version");

                    // scope 필터링 로그
                    if ("test".equals(scope) || "provided".equals(scope) || "system".equals(scope)) {
                        log.debug("❌ Maven 스코프로 인해 제외: {}:{}:{} (scope: {})",
                                groupId, artifactId, version, scope);
                        continue;
                    }

                    CpeDTO cpe = CpeDTO.builder()
                            .part(null) // application
                            .vendor(groupId)
                            .product(artifactId)
                            .version(cleanVersion(version))
                            .build();

                    dependencies.add(cpe);
                    log.info("✅ Maven 의존성 추가: {}:{}:{}",
                            cpe.getVendor(), cpe.getProduct(), cpe.getVersion());
                }
            }

            log.info("🎯 Maven 파싱 완료: 총 {}개 의존성 추출됨", dependencies.size());

        } catch (Exception e) {
            log.error("💥 Maven pom.xml 파싱 실패: {}", e.getMessage(), e);
        }

        return dependencies;
    }

    @Override
    public boolean supports(String fileName) {
        return "pom.xml".equals(fileName);
    }

    private String getTextContent(Element element, String tagName) {
        NodeList nodeList = element.getElementsByTagName(tagName);
        return nodeList.getLength() > 0 ? nodeList.item(0).getTextContent() : null;
    }

    private String cleanVersion(String version) {
        if (version == null) return null;
        // ${} 변수 처리
        if (version.contains("${")) {
            log.debug("🔧 Maven 변수가 포함된 버전 제외: {}", version);
            return null;
        }
        return version;
    }
}
