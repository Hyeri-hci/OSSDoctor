package com.ossdoctor.Repository;

import com.ossdoctor.Entity.BADGE_CATEGORY;
import com.ossdoctor.Entity.ContributionEntity;
import com.ossdoctor.Entity.UserBadgeEntity;
import com.ossdoctor.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadgeEntity, Long> {

    List<UserBadgeEntity> findByUser(Optional<UserEntity> user);

    @Query("SELECT CASE WHEN COUNT(ub) > 0 THEN true ELSE false END " +
            "FROM UserBadgeEntity ub " +
            "WHERE ub.user.idx = :userId AND ub.badge.level = :level AND ub.badge.category = :category")
    boolean existsByUserIdAndBadgeLevelAndBadgeCategory(@Param("userId") Long userId,
                                                        @Param("level") Integer level,
                                                        @Param("category") BADGE_CATEGORY category);

    List<UserBadgeEntity> findTop12ByUser_IdxOrderByAwardedAtDesc(Long userIdx);
}
