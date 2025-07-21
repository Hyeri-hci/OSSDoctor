package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserRankingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRankingRepository extends JpaRepository<UserRankingEntity, Long> {

}
