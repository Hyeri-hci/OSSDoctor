package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ossdoctor.DTO.CpeDTO;
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

    public Mono<List<VulnerabilityDTO>> getRepositoryVulnerabilities(String owner, String repo) {
        return Mono.fromCallable(() -> repositoryService.findByFullName(owner, repo))
                .doOnNext(repositoryDTO -> {
                    if (repositoryDTO == null) {
                        log.info("DB에서 {}의 {}리포지토리가 없음.", owner, repo);
                    } else {
                        log.info("DB에서 {}의 {}리포지토리 조회 성공.", owner, repo);
                    }
                })
                .flatMap(repositoryDTO -> {
                    // 의존성 파싱하기
                    Flux<CpeDTO> dependencies = dependencyExtractionService.extractDependencies(owner, repo)
                            .doOnNext(cpe -> log.info("파싱 결과 : {}", cpe));

                    // 테스트용 코드 추가
                    /*
                    CpeDTO testDto = CpeDTO.builder()
                            .part("a")
                            .vendor("10web")
                            .product("10web_social_post_feed")
                            .version("1.1.0")
                            .build();

                    dependencies = Flux.concat(dependencies, Flux.just(testDto));
                    */
                    // CPE 조회하기
                    Flux<CpeDTO> matchedCpeFlux = dependencies
                            .collectList()
                            .doOnNext(list -> {
                                if (list.isEmpty()) {
                                    log.info("{}에서 의존성 찾을 수 없음", repo);
                                } else {
                                    log.info("{}의 의존성 파싱 완료", repo);
                                }
                            })
                            .flatMapMany(Flux::fromIterable)
                            .flatMap(cpe -> cpeService.findCpeList(Flux.just(cpe)))
                            .doOnNext(cpe -> log.info("cpe : {}", cpe));

                    // NVD에 조회할 API URI 생성하기
                    Flux<String> cpeUriFlux = matchedCpeFlux
                            .collectList()
                            .doOnNext(list -> {
                                if (list.isEmpty()) {
                                    log.info("CPE DB에서 매칭되는 의존성 없음");
                                } else {
                                    log.info("CPE DB에서 CPE 매칭 성공");
                                }
                            })
                            .flatMapMany(Flux::fromIterable)
                            .flatMap(cpe -> nvdApiService.convertCpeListToUriList(Flux.just(cpe)))
                            .doOnNext(cpeUri -> log.info("cpe URI : {}", cpeUri));

                    // NVD에 API 날려서 응답 받기
                    Flux<JsonNode> nvdApiResponseJsonFlux = cpeUriFlux
                            .collectList()
                            .doOnNext(list -> {
                                if (list.isEmpty()) {
                                    log.info("API URI 생성 실패");
                                } else {
                                    log.info("API 보낼 URI 생성 성공");
                                }
                            })
                            .flatMapMany(Flux::fromIterable)
                            .flatMap(uri -> nvdApiService.scanVulnerabilities(Flux.just(uri)))
                            .doOnNext(jsonresponse -> log.info("nvd 응답(json) {}", jsonresponse));

                    Flux<VulnerabilityDTO> vulnerabilityDTOFlux = nvdApiService.convertToVulnerabilityDTOList(nvdApiResponseJsonFlux, repositoryDTO);

                    vulnerabilityService.checkAllDtoFluxAndSave(vulnerabilityDTOFlux,repositoryDTO);

                    return vulnerabilityService.findByRepositoryIdVulnerabilities(repositoryDTO);
                })
                .doOnSuccess(result -> log.info("finish"))
                .doOnError(e -> log.error("!!!!!에러 발생!!!!!", e))
                .onErrorResume(e -> {
                    log.error("!!!!!에러 발생!!!!!", e);
                    return Mono.just(Collections.emptyList());
                });
    }
}
