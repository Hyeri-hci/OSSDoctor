package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UpcyclingRecommendationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UpcyclingRecommendationRepository extends JpaRepository<UpcyclingRecommendationEntity, Long> {

}
