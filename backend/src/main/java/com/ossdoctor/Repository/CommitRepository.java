package com.ossdoctor.Repository;

import com.ossdoctor.Entity.CommitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommitRepository extends JpaRepository<CommitEntity, Long> {

}
