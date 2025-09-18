package com.ossdoctor.Repository;

import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContributionRepository extends JpaRepository<ContributionEntity, Long> {

    // userId로 가장 최근 기여 가져오기
    @Query("SELECT c FROM ContributionEntity c WHERE c.user.idx = :userId ORDER BY c.contributedAt DESC LIMIT 1")
    Optional<ContributionEntity> findTopByUserIdxOrderByContributedAtDesc(@Param("userId") Long userId);

    List<ContributionEntity> findByUserOrderByContributedAtDesc(Optional<UserEntity> user);
    
    // 중복 체크: 같은 사용자의 같은 레포지토리, 같은 번호의 기여가 있는지 확인
    @Query("SELECT COUNT(c) > 0 FROM ContributionEntity c WHERE c.user.idx = :userId AND c.repositoryName = :repositoryName AND c.number = :number AND c.referenceType = :referenceType")
    boolean existsByUserAndRepositoryAndNumberAndReferenceType(
        @Param("userId") Long userId, 
        @Param("repositoryName") String repositoryName, 
        @Param("number") Integer number, 
        @Param("referenceType") com.ossdoctor.Entity.REFERENCE_TYPE referenceType
    );
    
    // 중복 데이터 조회: 같은 사용자의 같은 레포지토리, 같은 번호의 기여 조회
    @Query("SELECT c FROM ContributionEntity c WHERE c.user.idx = :userId AND c.repositoryName = :repositoryName AND c.number = :number AND c.referenceType = :referenceType")
    Optional<ContributionEntity> findByUserAndRepositoryAndNumberAndReferenceType(
        @Param("userId") Long userId, 
        @Param("repositoryName") String repositoryName, 
        @Param("number") Integer number, 
        @Param("referenceType") com.ossdoctor.Entity.REFERENCE_TYPE referenceType
    );
}
