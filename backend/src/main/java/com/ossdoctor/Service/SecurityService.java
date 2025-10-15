package com.ossdoctor.Service;

import com.ossdoctor.DTO.VulnerabilityDTO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@AllArgsConstructor
public class SecurityService {
    private final DependencyExtractionService dependencyExtractionService;
    private final CpeService cpeService;
    private final NvdApiService nvdApiService;
    private final VulnerabilityService vulnerabilityService;
    private final RepositoryService repositoryService;

    /**
     * 실행 순서:
     * 1. Repository 조회
     * 2. 의존성 추출 (Flux)
     * 3. CPE 매칭 (Flux)
     * 4. NVD API 조회 (Flux)
     * 5. DTO 변환 (Flux<VulnerabilityDTO>)
     * 6. DB 저장 (블로킹, boundedElastic)
     * 7. 저장 후 DB에서 재조회하여 결과 반환
     */
    public Mono<List<VulnerabilityDTO>> getRepositoryVulnerabilities(String owner, String repo) {
        return Mono.fromCallable(() -> repositoryService.findByFullName(owner, repo))
                .flatMap(repositoryDTO -> {
                    return dependencyExtractionService.extractDependencies(owner, repo)
                            .flatMap(cpe -> cpeService.findCpeList(Flux.just(cpe)))
                            .flatMap(cpe -> nvdApiService.convertCpeListToUriList(Flux.just(cpe)))
                            .flatMap(uri -> nvdApiService.scanVulnerabilities(Flux.just(uri)))
                            .filter(json -> json != null && json.size() > 0)
                            .transform(jsonFlux -> nvdApiService.convertToVulnerabilityDTOList(jsonFlux, repositoryDTO))
                            .collectList()
                            .flatMap(vulnList ->
                                    Mono.fromRunnable(() ->
                                            vulnerabilityService.saveAllDtoList(vulnList)
                                    ).then(Mono.just(vulnList))
                            );
                })
                .onErrorResume(e -> {
                    log.error("에러 발생", e);
                    return Mono.just(Collections.emptyList());
                });
    }

}
