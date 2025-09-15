package com.ossdoctor.Repository;

import com.ossdoctor.Entity.BADGE_CATEGORY;
import com.ossdoctor.Entity.BadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<BadgeEntity, Long> {

    boolean existsByName(String name);

    @Override
    Optional<BadgeEntity> findById(Long aLong);

    Optional<BadgeEntity> findByCategoryAndLevel(BADGE_CATEGORY category, Integer level);
}
