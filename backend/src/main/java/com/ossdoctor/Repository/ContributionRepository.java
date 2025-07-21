package com.ossdoctor.Repository;

import com.ossdoctor.Entity.ContributionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContributionRepository extends JpaRepository<ContributionEntity, Long> {

}
