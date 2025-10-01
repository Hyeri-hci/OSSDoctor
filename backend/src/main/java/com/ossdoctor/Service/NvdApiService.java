package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.DTO.CpeDTO;
import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.DTO.VulnerabilityDTO;
import com.ossdoctor.Entity.RepositoryEntity;
import com.ossdoctor.Entity.SEVERITY;
import com.ossdoctor.Repository.VulnerabilityRepository;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * NVD API를 활용한 취약점 조회 서비스
 */
@Service
@Slf4j
public class NvdApiService {
    private static final String NVD_CVE_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
    private static final int REQUEST_DELAY_SECONDS = 1;
    private static final int MAX_RESULTS_PER_CPE = 50;

    @Value("${nvd.token:}")
    private String nvdToken;

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;


    public List<VulnerabilityDTO> convertToVulnerabilityDTOList(List<JsonNode> vulnerabilities, RepositoryDTO repositoryDTO) {
        List<VulnerabilityDTO> DTOList = new ArrayList<>();

        for (JsonNode vulNode : vulnerabilities) {
            try {
                 DTOList.addAll(JsonToVulnerabilityDTO(vulNode, repositoryDTO.getIdx()));
            } catch (Exception e) {
                log.error(e.getMessage(), e);
            }
        }

        return DTOList;
    }

    private List<VulnerabilityDTO> JsonToVulnerabilityDTO(JsonNode vulnerability, Long repositoryId) {




        JsonNode vulnerabilities = vulnerability.get("vulnerabilities");
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        List<VulnerabilityDTO> vulnerabilityDTOList = new ArrayList<>();

        for (JsonNode vul : vulnerabilities){
            log.info("✅의존성 DTO 만들기 위한 응답 파싱한 내용");
            String id = vul.path("cve").path("id").asText();
            log.info("CVE ID");
            log.info(id);
            SEVERITY severity = SEVERITY.valueOf(vul.path("cve").path("metrics").path("cvssMetricV31").path(0).path("cvssData").path("baseSeverity").asText());
            log.info("CVE SEVERITY");
            log.info(severity.toString());
            String description = vul.path("cve").path("descriptions").path(0).path("value").asText();
            log.info("CVE DESCRIPTION");
            log.info(description);
            VulnerabilityDTO vulner = VulnerabilityDTO.builder()
                    .cveId(id)
                    .repositoryId(repositoryId)
                    .severity(severity)
                    .description(description)
                    .detectedAt(ZonedDateTime.now())
                    .fixed(Boolean.FALSE)
                    .build();
            vulnerabilityDTOList.add(vulner);
        }
        return vulnerabilityDTOList;
    }

    /**
     * HTTP 클라이언트 및 JSON 매퍼 초기화
     */
    public NvdApiService() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(60))
                .writeTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * CPE URI 목록을 받아 NVD API를 통해 취약점을 조회하여 JSON 응답 리스트를 반환
     *
     * @param cpeUriList CPE URI 문자열 목록 (예: ["cpe:2.3:a:apache:tomcat:9.0.1:*:*:*:*:*:*:*"])
     * @return NVD API에서 받은 JSON 응답들의 리스트
     */
    public List<JsonNode> scanVulnerabilities(List<String> cpeUriList) {
        // === 입력값 검증 ===
        if (cpeUriList == null || cpeUriList.isEmpty()) {
            log.info("📋 조회할 CPE URI 목록이 비어있습니다");
            return new ArrayList<>();
        }

        log.info("🔍 NVD 취약점 스캔 시작: {}개 CPE URI", cpeUriList.size());

        // 전체 JSON 응답을 저장할 리스트
        List<JsonNode> allJsonResponses = new ArrayList<>();
        int processedCount = 0;

        // 각 CPE URI별로 순차 처리
        for (String cpeUri : cpeUriList) {
            try {
                processedCount++;
                log.info("📦 CPE URI 처리 중 ({}/{}): {}", processedCount, cpeUriList.size(), cpeUri);

                // NVD API 호출하여 JSON 응답 받기
                JsonNode jsonResponse = queryNvdApi(cpeUri);

                // JSON 응답을 리스트에 추가
                allJsonResponses.add(jsonResponse);

                // 취약점 개수 로깅
                JsonNode vulnArray = jsonResponse.path("vulnerabilities");
                int vulnCount = vulnArray.isArray() ? vulnArray.size() : 0;
                log.info("🛡️ {}개 취약점 발견", vulnCount);

                // API 율제한 준수를 위한 대기 (마지막 요청 제외)
                if (processedCount < cpeUriList.size()) {
                    log.debug("⏳ API 율제한 대기: {}초", REQUEST_DELAY_SECONDS);
                    TimeUnit.SECONDS.sleep(REQUEST_DELAY_SECONDS);
                }

            } catch (Exception e) {
                log.error("⚠️ CPE URI {} 취약점 조회 실패: {}", cpeUri, e.getMessage());
                // 개별 CPE 실패가 전체 프로세스를 중단하지 않도록 계속 진행
                // 실패한 경우에도 빈 JSON 객체를 추가할지는 요구사항에 따라 결정
            }
        }

        log.info("🎯 NVD 취약점 스캔 완료: {}개 CPE URI 처리, {}개 JSON 응답 수집됨",
                processedCount, allJsonResponses.size());

        return allJsonResponses;
    }

    /**
     * CPE DTO 목록을 CPE URI 문자열 목록으로 변환하는 헬퍼 메서드
     */
    public Flux<String> convertCpeListToUriList(Flux<CpeDTO> cpeDTOFlux) {
        return cpeDTOFlux.map(this::convertCpeToUri);
    }

    /**
     * 전체 JSON 응답에서 vulnerabilities 배열을 추출
     */
    private List<JsonNode> extractVulnerabilities(JsonNode fullResponse) {
        List<JsonNode> vulnerabilities = new ArrayList<>();
        JsonNode vulnArray = fullResponse.path("vulnerabilities");

        if (vulnArray.isArray()) {
            vulnArray.forEach(vulnerabilities::add);
        }

        return vulnerabilities;
    }

    /**
     * NVD API 호출 (단일 시도)
     */
    private JsonNode queryNvdApi(String cpeName) throws IOException {
        // HTTP 요청 URL 구성
        HttpUrl.Builder urlBuilder = Objects.requireNonNull(HttpUrl.parse(NVD_CVE_BASE_URL)).newBuilder()
                .addQueryParameter("virtualMatchString", cpeName)
                .addQueryParameter("resultsPerPage", String.valueOf(MAX_RESULTS_PER_CPE))
                .addQueryParameter("startIndex", "0");

        // HTTP 요청 헤더 구성
        Request.Builder requestBuilder = new Request.Builder()
                .url(urlBuilder.build())
                .addHeader("Accept", "application/json")
                .addHeader("User-Agent", "OSSDoctor/1.0")
                .get();

        // API 키가 있으면 추가
        if (nvdToken != null && !nvdToken.trim().isEmpty()) {
            requestBuilder.addHeader("apiKey", nvdToken);
        }

        Request request = requestBuilder.build();
        log.debug("🌐 NVD API 호출: {}", cpeName);

        // HTTP 요청 실행 및 응답 처리
        try (Response response = httpClient.newCall(request).execute()) {

            if (response.code() == 200) {
                // 성공: 전체 JSON 응답 반환
                String responseBody = Objects.requireNonNull(response.body()).string();
                JsonNode jsonResponse = objectMapper.readTree(responseBody);

                log.debug("✅ NVD API 응답 성공: {} 바이트", responseBody.length());
                return jsonResponse;

            } else if (response.code() == 404) {
                // CPE에 대한 취약점 없음: 빈 JSON 반환
                log.info("📭 해당 CPE에 대한 취약점 없음: {}", cpeName);
                return objectMapper.createObjectNode();

            } else {
                // 기타 오류
                String errorBody = response.body() != null ? response.body().string() : "No response body";
                throw new IOException(String.format("NVD API 호출 실패: %d %s - %s",
                        response.code(), response.message(), errorBody));
            }
        }
    }

    /**
     * CPE DTO를 NVD API용 CPE 2.3 URI로 변환
     */
    private String convertCpeToUri(CpeDTO cpe) {
        StringBuilder sb = new StringBuilder("cpe:2.3:");

        sb.append(sanitizeForCpe(cpe.getPart(), "*")).append(":");
        sb.append(sanitizeForCpe(cpe.getVendor(), "*")).append(":");
        sb.append(sanitizeForCpe(cpe.getProduct(), "*")).append(":");
        sb.append(sanitizeForCpe(cpe.getVersion(), "*"));
        sb.append(":*:*:*:*:*:*");

        return sb.toString();
    }

    /**
     * CPE 필드값 정제
     */
    private String sanitizeForCpe(String value, String defaultValue) {
        if (value == null || value.trim().isEmpty() ||
                "unknown".equalsIgnoreCase(value.trim())) {
            return defaultValue;
        }

        return value.toLowerCase()
                .replace(" ", "_")
                .replace("-", "_");
    }

    /**
     * JSON 응답을 VulnerabilityDTO 목록으로 변환
     *
     * NVD API 응답 구조:
     * - CVE API Schema: 전체 응답 구조
     * - CVSSv4.0, v3.1, v3.0, v2.0 Schema: 각 버전별 CVSS 메트릭

    private List<VulnerabilityDTO> convertToVulnerabilityDTOs(List<JsonNode> vulnerabilities, Long repositoryId) {
        List<VulnerabilityDTO> result = new ArrayList<>();

        for (JsonNode vulnNode : vulnerabilities) {
            try {
                JsonNode cve = vulnNode.path("cve");

                // 1. CVE ID 추출 (추가 정보용)
                String cveId = cve.path("id").asText("");

                // 2. 설명 추출 (영어 우선)
                String description = extractDescription(cve.path("descriptions"), cveId);

                // 3. CVSS 점수 및 심각도 추출 (v4.0 > v3.1 > v3.0 > v2.0 순서)
                SEVERITY severity = extractSeverity(cve.path("metrics"));

                // 4. 공개 날짜 추출 (ISO 8601 형식)
                ZonedDateTime detectedAt = parseDateTime(cve.path("published").asText());

                VulnerabilityDTO dto = VulnerabilityDTO.builder()
                        .repositoryId(repositoryId)
                        .severity(severity)
                        .description(description)
                        .detectedAt(detectedAt != null ? detectedAt : ZonedDateTime.now())
                        .fixed(Boolean.FALSE) // 초기에는 미수정 상태
                        .build();

                result.add(dto);

                log.debug("🔍 취약점 변환됨: {} - {} ({})", cveId, severity,
                        description.length() > 50 ? description.substring(0, 50) + "..." : description);

            } catch (Exception e) {
                log.warn("⚠️ 취약점 데이터 변환 실패: {}", e.getMessage());
            }
        }

        return result;
    }
     */

    /**
     * 다국어 설명에서 영어 설명 우선 추출
     * CVE API Schema의 descriptions 배열 처리
     */
    private String extractDescription(JsonNode descriptions, String cveId) {
        if (!descriptions.isArray() || descriptions.isEmpty()) {
            return "No description available for " + cveId;
        }

        // 영어 설명 우선 검색
        for (JsonNode desc : descriptions) {
            String lang = desc.path("lang").asText("");
            String value = desc.path("value").asText("");

            if ("en".equals(lang) && !value.trim().isEmpty()) {
                return value;
            }
        }

        // 영어가 없으면 첫 번째 설명 사용
        JsonNode firstDesc = descriptions.get(0);
        String value = firstDesc.path("value").asText("");
        return !value.trim().isEmpty() ? value : "No description available for " + cveId;
    }

    /**
     * CVSS 메트릭에서 심각도 추출
     *
     * 우선순위: CVSSv4.0 > CVSSv3.1 > CVSSv3.0 > CVSSv2.0
     * 각 버전별 Schema에 따른 severity 추출
     */
    private SEVERITY extractSeverity(JsonNode metrics) {
        try {
            // CVSSv4.0 시도 (최신 버전)
            JsonNode cvss40 = metrics.path("cvssMetricV40");
            if (cvss40.isArray() && !cvss40.isEmpty()) {
                JsonNode primaryMetric = findPrimaryMetric(cvss40);
                if (primaryMetric != null) {
                    String severity = primaryMetric.path("cvssData").path("baseSeverity").asText("");
                    if (!severity.isEmpty()) {
                        return mapToSeverity(severity);
                    }
                }
            }

            // CVSSv3.1 시도
            JsonNode cvss31 = metrics.path("cvssMetricV31");
            if (cvss31.isArray() && !cvss31.isEmpty()) {
                JsonNode primaryMetric = findPrimaryMetric(cvss31);
                if (primaryMetric != null) {
                    String severity = primaryMetric.path("cvssData").path("baseSeverity").asText("");
                    if (!severity.isEmpty()) {
                        return mapToSeverity(severity);
                    }
                }
            }

            // CVSSv3.0 시도
            JsonNode cvss30 = metrics.path("cvssMetricV30");
            if (cvss30.isArray() && !cvss30.isEmpty()) {
                JsonNode primaryMetric = findPrimaryMetric(cvss30);
                if (primaryMetric != null) {
                    String severity = primaryMetric.path("cvssData").path("baseSeverity").asText("");
                    if (!severity.isEmpty()) {
                        return mapToSeverity(severity);
                    }
                }
            }

            // CVSSv2.0 시도 (점수 기반 매핑)
            JsonNode cvss2 = metrics.path("cvssMetricV2");
            if (cvss2.isArray() && !cvss2.isEmpty()) {
                JsonNode primaryMetric = findPrimaryMetric(cvss2);
                if (primaryMetric != null) {
                    double baseScore = primaryMetric.path("cvssData").path("baseScore").asDouble(0.0);
                    if (baseScore > 0.0) {
                        return mapScoreToSeverity(baseScore);
                    }
                }
            }

        } catch (Exception e) {
            log.warn("⚠️ 심각도 추출 실패: {}", e.getMessage());
        }

        return SEVERITY.UNKNOWN;
    }

    /**
     * CVSS 메트릭 배열에서 Primary 소스를 찾거나 첫 번째 메트릭 반환
     */
    private JsonNode findPrimaryMetric(JsonNode metricsArray) {
        // Primary 소스 우선 검색
        for (JsonNode metric : metricsArray) {
            String type = metric.path("type").asText("");
            if ("Primary".equals(type)) {
                return metric;
            }
        }

        // Primary가 없으면 첫 번째 메트릭 사용
        return metricsArray.size() > 0 ? metricsArray.get(0) : null;
    }

    /**
     * 문자열 심각도를 SEVERITY enum으로 매핑
     * CVSSv3.x 및 CVSSv4.0의 baseSeverity 값 처리
     */
    private SEVERITY mapToSeverity(String severity) {
        if (severity == null || severity.trim().isEmpty()) {
            return SEVERITY.UNKNOWN;
        }

        switch (severity.toUpperCase()) {
            case "NONE": return SEVERITY.LOW;      // NONE을 LOW로 매핑
            case "LOW": return SEVERITY.LOW;
            case "MEDIUM": return SEVERITY.MEDIUM;
            case "HIGH": return SEVERITY.HIGH;
            case "CRITICAL": return SEVERITY.CRITICAL;
            default:
                log.debug("🔍 알 수 없는 심각도 값: {}", severity);
                return SEVERITY.UNKNOWN;
        }
    }

    /**
     * CVSSv2 숫자 점수를 심각도로 매핑
     * CVSSv2.0 Schema의 baseScore 처리 (0.0 ~ 10.0)
     */
    private SEVERITY mapScoreToSeverity(double score) {
        if (score >= 7.0) return SEVERITY.HIGH;      // 7.0~10.0: HIGH
        if (score >= 4.0) return SEVERITY.MEDIUM;    // 4.0~6.9: MEDIUM
        if (score > 0.0) return SEVERITY.LOW;        // 0.1~3.9: LOW
        return SEVERITY.UNKNOWN;                     // 0.0: UNKNOWN
    }

    /**
     * ISO 8601 날짜 문자열을 ZonedDateTime으로 파싱
     * CVE API Schema의 published 필드 처리
     */
    private ZonedDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }

        try {
            // ISO 8601 형식 처리 (예: "2023-01-15T10:30:00.000")
            if (dateStr.contains("T")) {
                // 밀리초 및 타임존 정보 제거 후 파싱
                String cleanDateStr = dateStr.replaceAll("\\.\\d{3}.*", "");
                return ZonedDateTime.parse(cleanDateStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } else {
                // 날짜만 있는 경우 (예: "2023-01-15")
                return ZonedDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
        } catch (Exception e) {
            log.warn("⚠️ 날짜 파싱 실패: {} - {}", dateStr, e.getMessage());
            return ZonedDateTime.now(); // 파싱 실패 시 현재 시각 사용
        }
    }
}