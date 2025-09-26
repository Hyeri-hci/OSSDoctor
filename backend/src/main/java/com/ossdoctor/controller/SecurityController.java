package com.ossdoctor.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
         * GitHub 리포지토리 URL 쿼리 파라미터로 받아 의존성 파싱 후 VulnerabilityDTO 리스트만 반환
         */
        @GetMapping
        public ResponseEntity<List<VulnerabilityDTO>> parseDependencies(@RequestParam("repo") String repo) {
            try {
                log.info("🔗 요청받은 GitHub URL: {}", repo);

                // github에서 모든 파일 순회해서 의존성 가져오기
                List<CpeDTO> dependencies = dependencyExtractionService.extractDependencies(repo);
                // 테스트용 dto추가
                CpeDTO cpeDTO = CpeDTO.builder()
                        .part("a")
                        .vendor("10web")
                        .product("10web_social_post_feed")
                        .version("1.1.0")
                        .build();
                dependencies.add(cpeDTO);

                Long repoId = 123456L;

                if (dependencies.isEmpty()) {
                    log.info("❌ 의존성을 찾을 수 없음: {}", repo);
                    return ResponseEntity.noContent().build();
                }

                // CPE DB 조회해서 매칭되는 결과 확인하기
                List<CpeDTO> matchedCpeList = cpeService.findCpeList(dependencies);
                if (matchedCpeList.isEmpty()) {
                    log.info("❌ CPE DB에서 매칭되는 의존성 없음");
                    return ResponseEntity.noContent().build();
                }

                // CPE 결과를 갖고 호출할 CPE URI LIST 생성
                List<String> cpeUriList = nvdApiService.convertCpeListToUriList(matchedCpeList);
                log.info("cpeUriList");
                log.info(String.valueOf(cpeUriList));

                // API 날려서 취약점 조회후 응답을 저장
                List<JsonNode> vulnerabilityJsonList = nvdApiService.scanVulnerabilities(cpeUriList);
                log.info("vulnerabilityJsonList");
                log.info(String.valueOf(vulnerabilityJsonList));

                // 응답 결과 List를 받아서 DTO 리스트로 반환
                List<VulnerabilityDTO> vulnerabilityDTOList = nvdApiService.convertToVulnerabilityDTOList(vulnerabilityJsonList, repoId);
                log.info("vulnerabilityDTOList");
                log.info(String.valueOf(vulnerabilityDTOList));

                vulnerabilityService.checkAllDtoListAndSave(vulnerabilityDTOList, repoId);

                return ResponseEntity.ok(vulnerabilityDTOList);

            } catch (IllegalArgumentException e) {
                log.error("❌ 잘못된 GitHub URL 요청: {}", repo, e);
                return ResponseEntity.badRequest().build();
            } catch (Exception e) {
                log.error("❌ 의존성 파싱 중 오류 발생: {}", repo, e);
                return ResponseEntity.internalServerError().build();
            }
        }



}