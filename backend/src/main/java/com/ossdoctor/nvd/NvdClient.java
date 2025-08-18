package com.ossdoctor.nvd;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;

import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

public class NvdClient {

    private static final String BASE = "https://services.nvd.nist.gov/rest/json";
    private final OkHttpClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;

    public NvdClient(String apiKey) {
        this.apiKey = apiKey;
        this.http = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(15))
                .readTimeout(Duration.ofSeconds(60))
                .writeTimeout(Duration.ofSeconds(15))
                .build();
    }

    public List<JsonNode> getVulnsByCpe(String cpe23Uri, boolean isVulnerable, String severityCSV,
                                        int maxResults) throws IOException, InterruptedException {
        List<JsonNode> acc = new ArrayList<>();
        int startIndex = 0;

        while (acc.size() < maxResults) {
            HttpUrl.Builder url = Objects.requireNonNull(HttpUrl.parse(BASE + "/cves/2.0")).newBuilder()
                    .addQueryParameter("startIndex", String.valueOf(startIndex))
                    .addQueryParameter("resultsPerPage", String.valueOf(Math.min(200, maxResults - acc.size())))
                    .addQueryParameter("cpeName", cpe23Uri);

            if (isVulnerable) url.addQueryParameter("isVulnerable", "");
            if (severityCSV != null && !severityCSV.isEmpty()) {
                url.addQueryParameter("cvssV3Severity", severityCSV); // e.g., "HIGH,CRITICAL"
            }
            Request req = new Request.Builder()
                    .url(url.build())
                    .addHeader("Accept", "application/json")
                    .addHeader("apiKey", apiKey)
                    .get()
                    .build();

            try (Response resp = http.newCall(req).execute()) {
                int code = resp.code();
                if (code == 200) {
                    JsonNode root = mapper.readTree(Objects.requireNonNull(resp.body()).string());
                    JsonNode vulns = root.path("vulnerabilities");
                    if (!vulns.isArray() || vulns.size() == 0) break;
                    for (JsonNode v : vulns) acc.add(v);
                    int total = root.path("totalResults").asInt(0);
                    startIndex += vulns.size();
                    if (startIndex >= total) break;
                } else if (code == 429 || code == 503) {
                    // 권고: 최소 6초 대기
                    TimeUnit.SECONDS.sleep(6);
                    continue;
                } else {
                    throw new IOException("NVD error: " + code + " " + resp.message());
                }
            }
            // 호출 간 슬립(키 사용 시에도 권장)
            TimeUnit.SECONDS.sleep(1);
        }
        return acc;
    }

    public static boolean versionIncluded(JsonNode matchCriteriaNode, String targetVersion) {
        // configurations.nodes[].cpeMatch[].versionStartIncluding/Excluding, versionEndIncluding/Excluding 확인
        // 매우 단순한 문자열 비교. 실제로는 정규화/semver/epoch 처리 필요.
        String vStartInc = optStr(matchCriteriaNode, "versionStartIncluding");
        String vStartExc = optStr(matchCriteriaNode, "versionStartExcluding");
        String vEndInc = optStr(matchCriteriaNode, "versionEndIncluding");
        String vEndExc = optStr(matchCriteriaNode, "versionEndExcluding");
        String vExact = optStr(matchCriteriaNode, "version");

        if (vExact != null && !vExact.equalsIgnoreCase("*")) {
            return vExact.equalsIgnoreCase(targetVersion);
        }
        // naive 비교: 문자열 비교. 실무에서는 버전 비교 파서 필수.
        if (vStartInc != null && targetVersion.compareTo(vStartInc) < 0) return false;
        if (vStartExc != null && targetVersion.compareTo(vStartExc) <= 0) return false;
        if (vEndInc != null && targetVersion.compareTo(vEndInc) > 0) return false;
        if (vEndExc != null && targetVersion.compareTo(vEndExc) >= 0) return false;
        return true;
    }

    private static String optStr(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return (v != null && !v.isNull()) ? v.asText() : null;
    }
}
