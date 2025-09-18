package com.ossdoctor.Repository;

import com.ossdoctor.Entity.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelRepository extends JpaRepository<LevelEntity,Long> {
    boolean existsByLevelId(Long levelId);

    // 누적 경험치(totalExp) 이하 중 가장 높은 레벨 조회
    LevelEntity findTopByRequiredExpLessThanEqualOrderByLevelIdDesc(Integer totalExp);
}
