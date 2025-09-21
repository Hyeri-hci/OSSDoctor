package com.ossdoctor.Service;

import com.ossdoctor.Entity.CpeEntity;
import com.ossdoctor.DTO.CpeDTO;
import com.ossdoctor.Repository.CpeRepository;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CpeService {
    private CpeRepository cpeRepository;

    // Entity를 DTO로 변환
    private CpeDTO toDTO(CpeEntity cpeEntity) {
        return CpeDTO.builder()
                .idx(cpeEntity.getIdx())
                .part(cpeEntity.getPart())
                .vendor(cpeEntity.getVendor())
                .product(cpeEntity.getProduct())
                .version(cpeEntity.getVersion())
                .build();
    }

    // DTO를 Entity로 변환
    private CpeEntity toEntity(CpeDTO cpeDTO) {
        return CpeEntity.builder()
                .idx(cpeDTO.getIdx())
                .part(cpeDTO.getPart())
                .vendor(cpeDTO.getVendor())
                .product(cpeDTO.getProduct())
                .version(cpeDTO.getVersion())
                .build();
    }

    /**
     * 취약점 조회할 DTO 리스트를 입력받아서 CPE DB에서 매칭되는 항목만 반환
     * @param dtoList 파싱된 의존성 목록
     * @return DB에서 발견된 CPE 목록 (중복 제거됨)
     */
    public List<CpeDTO> findCpeList(List<CpeDTO> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            return new ArrayList<>();
        }

        log.info("🔍 CPE 매칭 시작: {}개 의존성 조회", dtoList.size());

        Set<CpeDTO> resultSet = new LinkedHashSet<>(); // 중복 제거를 위해 Set 사용
        int matchedCount = 0;
        int totalSearched = 0;

        for (CpeDTO inputDto : dtoList) {
            if (inputDto.getProduct() == null || inputDto.getProduct().trim().isEmpty()) {
                log.debug("⏭️ 제품명이 없는 항목 건너뛰기: {}", inputDto);
                continue;
            }

            totalSearched++;
            List<CpeDTO> entityList = searchCpe(inputDto);

            if (!entityList.isEmpty()) {
                matchedCount++;
                log.info("✅ CPE 매칭 발견: {} -> {}개 결과",
                        formatCpeString(inputDto), entityList.size());

                // 개별 매칭 결과 로깅
                for (CpeDTO dto : entityList) {
                    resultSet.add(dto);
                    log.debug("  📋 매칭된 CPE: {}", formatCpeString(dto));
                }
            } else {
                log.debug("❌ CPE 매칭 실패: {}", formatCpeString(inputDto));
            }
        }

        List<CpeDTO> resultList = new ArrayList<>(resultSet);

        log.info("🎯 CPE 매칭 완료: {}개 중 {}개 매칭, 총 {}개 CPE 발견 (중복 제거 후)",
                totalSearched, matchedCount, resultList.size());

        return resultList;
    }

    /**
     * 입력 DTO에 맞는 CPE Entity 검색
     */
    private List<CpeDTO> searchCpe(CpeDTO inputDto) {
        String vendor = inputDto.getVendor();
        String product = inputDto.getProduct();
        String version = inputDto.getVersion();

        // 1. Vendor, Product, Version 모두 있는 경우 (가장 정확한 매칭)
        if (vendor != null && !vendor.trim().isEmpty() &&
                version != null && !version.trim().isEmpty()) {

            List<CpeEntity> exactMatch = cpeRepository.findByVendorAndProductAndVersion(vendor, product, version);
            if (!exactMatch.isEmpty()) {
                log.debug("🎯 정확한 매칭 (vendor:product:version): {}:{}:{}", vendor, product, version);
                List<CpeDTO> dtoMatch =  new ArrayList<>();
                for(CpeEntity entity :exactMatch) {
                    dtoMatch.add(toDTO(entity));
                }
                return dtoMatch;
            }
        }

        // 2. Vendor와 Product만 있는 경우
        if (vendor != null && !vendor.trim().isEmpty()) {
            List<CpeEntity> vendorProductMatch = cpeRepository.findByVendorAndProduct(vendor, product);
            if (!vendorProductMatch.isEmpty()) {
                log.debug("🎯 부분 매칭 (vendor:product): {}:{}", vendor, product);
                List<CpeDTO> dtoMatch =  new ArrayList<>();
                for(CpeEntity entity :vendorProductMatch) {
                    dtoMatch.add(toDTO(entity));
                }
                return dtoMatch;
            }
        }

        // 3. Product와 Version만 있는 경우
        if (version != null && !version.trim().isEmpty()) {
            List<CpeEntity> productVersionMatch = cpeRepository.findByProductAndVersion(product, version);
            if (!productVersionMatch.isEmpty()) {
                log.debug("🎯 부분 매칭 (product:version): {}:{}", product, version);
                List<CpeDTO> dtoMatch =  new ArrayList<>();
                for(CpeEntity entity :productVersionMatch) {
                    dtoMatch.add(toDTO(entity));
                }
                return dtoMatch;
            }
        }

        // 4. Product만으로 검색 (마지막 선택)
        List<CpeEntity> productOnlyMatch = cpeRepository.findByProduct(product);
        if (!productOnlyMatch.isEmpty()) {
            log.debug("🎯 기본 매칭 (product): {}", product);
            List<CpeDTO> dtoMatch = new ArrayList<>();
            for(CpeEntity entity :productOnlyMatch) {
                dtoMatch.add(toDTO(entity));
            }
            return dtoMatch;
        }

        return new ArrayList<>();
    }

    /**
     * CPE 정보를 문자열로 포맷팅
     */
    private String formatCpeString(CpeDTO cpe) {
        StringBuilder sb = new StringBuilder();

        if (cpe.getVendor() != null && !cpe.getVendor().isEmpty()) {
            sb.append(cpe.getVendor()).append(":");
        }

        sb.append(cpe.getProduct() != null ? cpe.getProduct() : "unknown");

        if (cpe.getVersion() != null && !cpe.getVersion().isEmpty()) {
            sb.append(":").append(cpe.getVersion());
        }

        return sb.toString();
    }
}
