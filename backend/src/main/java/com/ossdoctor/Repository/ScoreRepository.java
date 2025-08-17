package com.ossdoctor.Repository;

import com.ossdoctor.Entity.ScoreEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<ScoreEntity, Long> {
    List<ScoreEntity> findByRepositoryIdx(Long repositoryId);
}
