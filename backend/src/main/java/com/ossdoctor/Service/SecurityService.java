package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ossdoctor.DTO.CpeDTO;
import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.DTO.ScoreDTO;
import com.ossdoctor.DTO.VulnerabilityDTO;
import com.ossdoctor.Entity.RepositoryEntity;
import com.ossdoctor.Entity.SCORE_TYPE;
import com.ossdoctor.Repository.RepositoryRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@AllArgsConstructor
public class SecurityService {
    private final DependencyExtractionService dependencyExtractionService;
    private final RepositoryRepository repositoryRepository;
    private final CpeService cpeService;
    private final NvdApiService nvdApiService;
    private final VulnerabilityService vulnerabilityService;
    private final RepositoryService repositoryService;


    public void getRepositoryVulnerabilities(String owner, String repo) {
        try {
            // 리포지토리 찾기
            RepositoryDTO repositoryDTO = repositoryService.findByFullName(owner, repo);
            if (repositoryDTO == null) {
                log.info("DB에서 {}의 {}리포지토리가 없음.", owner, repo);

            } else {
                log.info("DB에서 {}의 {}리포지토리 조회 성공.", owner, repo);
            }

            // 의존성 파싱하기
            Flux<CpeDTO> dependencies = dependencyExtractionService.extractDependencies(owner, repo);
            dependencies.hasElements()
                    .flatMap(has -> {
                        if(!has) log.info("{}에서 의존성 찾을 수 없음", repo);
                        else log.info("{}의 의존성 파싱 완료", repo);
                        return Mono.empty();
                    })
                    .subscribe();

            // CPE 조회하기
            List<CpeDTO> matchedCpeList = cpeService.findCpeList(dependencies);
            if (matchedCpeList.isEmpty()) {
                log.info("CPE DB에서 매칭되는 의존성 없음");
            } else {
                log.info("CPE DB에서 {}개의 CPE 매칭", matchedCpeList.size());
            }

            // NVD에 조회할 API URI 생성하기
            List<String> cpeUriList = nvdApiService.convertCpeListToUriList(matchedCpeList);
            if (cpeUriList.isEmpty()) {
                log.info("API URI 생성 실패");
            }
            else {
                log.info("API 보낼 URI 생성 성공");
            }

            // NVD에 API 날려서 DTO 리스트로 반환하기
            List<VulnerabilityDTO> returnVulnerabilities = nvdApiService.convertToVulnerabilityDTOList(nvdApiService.scanVulnerabilities(cpeUriList), repositoryDTO);

            vulnerabilityService.checkAllDtoListAndSave(returnVulnerabilities, repositoryDTO);
            log.info("finish");
        } catch (Exception e) {
            log.error("!!!!!에러 발생!!!!!\n",e);
        }
    }
}
