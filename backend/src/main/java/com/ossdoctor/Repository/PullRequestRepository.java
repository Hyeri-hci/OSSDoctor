package com.ossdoctor.Repository;

import com.ossdoctor.Entity.PullRequestEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PullRequestRepository extends JpaRepository<PullRequestEntity, Long> {

}
