package com.ossdoctor.nvd;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class CpeCandidateBuilder {

    // 매우 단순화된 규칙. 실무에서는 사전/정규화 로직을 보강하세요.
    public static List<String> buildCandidates(Dependency dep) {
        List<String> out = new ArrayList<>();
        if (dep == null || dep.getEco() == null) return out;

        String name = safe(dep.getName());
        String version = safe(dep.getVersion());

        switch (dep.getEco()) {
            case MAVEN: {
                // name = groupId:artifactId
                if (!name.isEmpty()) {
                    String[] parts = name.split(":");
                    if (parts.length == 2) {
                        String vendor = sanitize(parts[0]);
                        String product = sanitize(parts[1]);
                        String v = sanitizeVersion(version);
                        out.add(String.format("cpe:2.3:a:%s:%s:%s:*:*:*:*:*:*:*", vendor, product, v));
                    }
                }
                break;
            }
            case NPM: {
                // @scope/name 또는 name
                String vendor;
                String product;

                if (!name.isEmpty() && name.startsWith("@")) {
                    // 예) @scope/name
                    int slash = name.indexOf('/');
                    if (slash > 1 && slash < name.length() - 1) {
                        String scope = name.substring(1, slash);     // "scope"
                        String pkg   = name.substring(slash + 1);     // "name"
                        vendor = sanitize(scope);
                        product = sanitize(pkg);
                    } else {
                        // 비정상 케이스: "@scope"만 존재하거나 "/” 뒷부분 없음
                        String scope = name.substring(1);
                        vendor = sanitize(scope);
                        product = sanitize(scope);
                    }
                } else {
                    // scope 없는 패키지: 벤더/제품 동일 이름로 단순 매핑
                    vendor = sanitize(name);
                    product = sanitize(name);
                }

                out.add(String.format(
                        "cpe:2.3:a:%s:%s:%s:*:*:*:*:*:*:*",
                        vendor, product, sanitizeVersion(version)
                ));
                break;
            }
            case PYPI: {
                // pypi는 벤더가 불명확: 임시로 product=표준화명, vendor=product
                String pname = normalizePypiName(name);
                out.add(String.format(
                        "cpe:2.3:a:%s:%s:%s:*:*:*:*:*:*:*",
                        pname, pname, sanitizeVersion(version)
                ));
                break;
            }
            default:
                break;
        }
        return out;
    }

    private static String sanitize(String s) {
        // CPE 2.3 허용 문자 이스케이프 최소화. 실제로는 더 많은 이스케이프가 필요.
        if (s == null) return "";
        return s.toLowerCase().replace(" ", "_");
    }

    private static String sanitizeVersion(String v) {
        if (v == null) return "";
        return v.replace(" ", "_");
    }

    private static String normalizePypiName(String n) {
        if (n == null) return "";
        return n.toLowerCase().replace("-", "_");
    }

    private static String safe(String s) {
        return Objects.toString(s, "").trim();
    }
}
