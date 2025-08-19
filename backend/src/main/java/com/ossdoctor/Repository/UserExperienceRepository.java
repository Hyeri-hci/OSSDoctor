package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserExperienceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserExperienceRepository extends JpaRepository<UserExperienceEntity, Long> {
    
    // 특정 사용자와 활동에 대한 경험치 기록이 이미 있는지 확인
    @Query("SELECT COUNT(ue) > 0 FROM UserExperienceEntity ue WHERE ue.user.idx = :userId AND ue.activity.idx = :activityId")
    boolean existsByUserIdAndActivityId(@Param("userId") Long userId, @Param("activityId") Long activityId);
}
