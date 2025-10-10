package com.ossdoctor.Repository;

import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.REFERENCE_TYPE;
import com.ossdoctor.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContributionRepository extends JpaRepository<ContributionEntity, Long> {

    // userId로 가장 최근 기여 가져오기
    Optional<ContributionEntity> findTopByUserIdxOrderByContributedAtDesc(Long userId);

    List<ContributionEntity> findByUserOrderByContributedAtDesc(Optional<UserEntity> user);

    List<ContributionEntity> findByUserIdxAndEndAtIsNull(Long user_idx);
    
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

    // 리더보드용 쿼리들 추가
    
    // 특정 사용자의 기간별 커밋 수 조회
    @Query("SELECT COUNT(c) FROM ContributionEntity c WHERE c.user.idx = :userId AND c.referenceType = 'COMMIT' AND c.contributedAt >= :fromDate AND c.contributedAt < :toDate")
    int countCommitsByUserAndDateRange(
        @Param("userId") Long userId, 
        @Param("fromDate") ZonedDateTime fromDate,
        @Param("toDate") ZonedDateTime toDate
    );

    // 특정 사용자의 기간별 PR 수 조회
    @Query("SELECT COUNT(c) FROM ContributionEntity c WHERE c.user.idx = :userId AND c.referenceType = 'PR' AND c.contributedAt >= :fromDate AND c.contributedAt < :toDate")
    int countPRsByUserAndDateRange(
        @Param("userId") Long userId, 
        @Param("fromDate") ZonedDateTime fromDate,
        @Param("toDate") ZonedDateTime toDate
    );

    // 특정 사용자의 기간별 이슈 수 조회
    @Query("SELECT COUNT(c) FROM ContributionEntity c WHERE c.user.idx = :userId AND c.referenceType = 'ISSUE' AND c.contributedAt >= :fromDate AND c.contributedAt < :toDate")
    int countIssuesByUserAndDateRange(
        @Param("userId") Long userId, 
        @Param("fromDate") ZonedDateTime fromDate,
        @Param("toDate") ZonedDateTime toDate
    );

    // 특정 사용자의 기간별 리뷰 수 조회
    @Query("SELECT COUNT(c) FROM ContributionEntity c WHERE c.user.idx = :userId AND c.referenceType = 'REVIEW' AND c.contributedAt >= :fromDate AND c.contributedAt < :toDate")
    int countReviewsByUserAndDateRange(
        @Param("userId") Long userId, 
        @Param("fromDate") ZonedDateTime fromDate,
        @Param("toDate") ZonedDateTime toDate
    );

    // 특정 사용자의 기간별 MERGED 상태인 PR 수 조회 (경험치 계산용)
    @Query("SELECT COUNT(c) FROM ContributionEntity c WHERE c.user.idx = :userId AND c.referenceType = 'PR' AND c.state = 'MERGED' AND c.contributedAt >= :fromDate AND c.contributedAt < :toDate")
    int countMergedPRsByUserAndDateRange(
        @Param("userId") Long userId, 
        @Param("fromDate") ZonedDateTime fromDate,
        @Param("toDate") ZonedDateTime toDate
    );

    // 특정 사용자의 연속 기여 일수 계산용 - 기여 엔티티들 조회해서 날짜 변환은 서비스에서 처리
    @Query("SELECT c FROM ContributionEntity c WHERE c.user.idx = :userId ORDER BY c.contributedAt DESC")
    List<ContributionEntity> findContributionsByUser(@Param("userId") Long userId);
}
