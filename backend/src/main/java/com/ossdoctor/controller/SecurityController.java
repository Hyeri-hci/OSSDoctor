package com.ossdoctor.controller;

import com.ossdoctor.DTO.CpeDTO;
import com.ossdoctor.DTO.VulnerabilityDTO;
import com.ossdoctor.Service.CpeService;
import com.ossdoctor.Service.DependencyExtractionService;
import com.ossdoctor.Service.NvdApiService;
import com.ossdoctor.Service.VulnerabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/security")
@RequiredArgsConstructor
@Slf4j
public class SecurityController {

    private final DependencyExtractionService dependencyExtractionService;
    private final CpeService cpeService;
    private final NvdApiService nvdApiService;
    private final VulnerabilityService vulnerabilityService;

    /**
     * GitHub 리포지토리 URL 쿼리 파라미터로 받아 의존성 파싱 후 결과 반환
     *
     * @param repo GitHub 리포지토리 URL (예: https://github.com/facebook/react)
     * @return 의존성 CpeDTO 리스트
     */
    @GetMapping
    public ResponseEntity<List<CpeDTO>> parseDependencies(@RequestParam("repo") String repo) {
        try {
            log.info("🔗 요청받은 GitHub URL: {}", repo);

            // 의존성 추출 서비스 호출
            List<CpeDTO> dependencies = dependencyExtractionService.extractDependencies(repo);

            if (dependencies.isEmpty()) {
                log.info("❌ 의존성을 찾을 수 없음: {}", repo);
                return ResponseEntity.noContent().build();
            }

            log.info("✅ 의존성 {}개 추출 완료: {}", dependencies.size(), repo);

            List<CpeDTO> matchedCpeList = cpeService.findCpeList(dependencies);
            if (matchedCpeList.isEmpty()) {
                log.info("❌ CPE DB에서 매칭되는 의존성 없음");
                return ResponseEntity.noContent().build();
            }

            // NvdApiService를 주입했다고 가정
            List<String> cpeUriList = nvdApiService.convertCpeListToUriList(matchedCpeList);
            log.info(cpeUriList.toString());

// 임의의 repositoryId (필요시 파라미터로 받거나 DB에서 조회)
            Long repositoryId = 11231241L; // 실제로는 적절한 ID로 변경

// NVD API 호출을 통한 취약점 조회
            List<VulnerabilityDTO> vulnerabilities = nvdApiService.scanVulnerabilities(cpeUriList, repositoryId);

            log.info("🛡️ NVD API를 통해 조회된 취약점 수: {}", vulnerabilities.size());

            vulnerabilityService.saveAllDtoList(vulnerabilities);

// 취약점 정보도 함께 응답에 포함시키고 싶다면 DTO에 맞게 포장 후 사용
// 여기서는 일단 의존성+취약점 정보 하나로 리턴하는 예시 생략

            return ResponseEntity.ok(matchedCpeList);

        } catch (IllegalArgumentException e) {
            log.error("잘못된 GitHub URL 요청: {}", repo, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("의존성 파싱 중 오류 발생: {}", repo, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
