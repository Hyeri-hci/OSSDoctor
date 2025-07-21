package com.ossdoctor.Repository;

import com.ossdoctor.Entity.RepositoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositoryRepository extends JpaRepository<RepositoryEntity, Long> {

    Optional<RepositoryEntity> findById(Long id);
}
