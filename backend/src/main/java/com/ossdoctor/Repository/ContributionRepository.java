package com.ossdoctor.Repository;

import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContributionRepository extends JpaRepository<ContributionEntity, Long> {

    // userId로 가장 최근 기여 가져오기
    Optional<ContributionEntity> findTopByUserIdxOrderByContributedAtDesc(Long userId);

    List<ContributionEntity> findByUserOrderByContributedAtDesc(Optional<UserEntity> user);
}
