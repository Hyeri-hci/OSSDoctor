package com.ossdoctor.Service;

import com.ossdoctor.DTO.VulnerabilityDTO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
     * 전체 흐름:
     * 1) repo 조회 (동기 -> fromCallable)
     * 2) dependencies -> cpe matching -> uri -> nvd scan -> convert to VulnerabilityDTO Flux
     * 3) collectList() 해서 vulnList 획득
     * 4) vulnerabilityService.reconcileAndSave(vulnList, repositoryDTO) 실행 (boundedElastic)
     * 5) 저장 완료 후 vulnerabilityService.findByRepositoryIdAndFixedFalseMono(...)로 최신 리스트 조회하여 반환
     */
    public Mono<List<VulnerabilityDTO>> getRepositoryVulnerabilities(String owner, String repo) {
        return Mono.fromCallable(() -> repositoryService.findByFullName(owner, repo))
                .flatMap(repositoryDTO -> {
                    if (repositoryDTO == null) {
                        log.warn("⚠️ Repository not found: {}/{}", owner, repo);
                        return Mono.just(Collections.<VulnerabilityDTO>emptyList());
                    }

                    // Build vulnFlux (single use) — do not cause multiple subscriptions
                    Flux<VulnerabilityDTO> vulnFlux = dependencyExtractionService.extractDependencies(owner, repo)
                            .flatMap(cpe -> cpeService.findCpeList(Flux.just(cpe)))
                            .flatMap(cpe -> nvdApiService.convertCpeListToUriList(Flux.just(cpe)))
                            .flatMap(uri -> nvdApiService.scanVulnerabilities(Flux.just(uri)))
                            .filter(json -> json != null && json.size() > 0)
                            .transform(jsonFlux -> nvdApiService.convertToVulnerabilityDTOList(jsonFlux, repositoryDTO))
                            .distinct(VulnerabilityDTO::getCveId); // in-flux dedupe

                    // collect, reconcile/save in boundedElastic, then read DB and return
                    return vulnFlux.collectList()
                            .flatMap(vulnList -> {
                                // 1) if empty -> return current DB active list (no changes)
                                if (vulnList == null || vulnList.isEmpty()) {
                                    return vulnerabilityService.findByRepositoryIdMono(repositoryDTO);
                                }

                                // 2) reconcile & save on boundedElastic, then fetch latest active list
                                return vulnerabilityService.reconcileAndSave(vulnList, repositoryDTO)
                                        .then(vulnerabilityService.findByRepositoryIdMono(repositoryDTO));
                            });
                })
                .doOnError(e -> log.error("getRepositoryVulnerabilities error", e))
                .onErrorResume(e -> {
                    log.error("getRepositoryVulnerabilities exception", e);
                    return Mono.just(Collections.emptyList());
                });
    }
}
