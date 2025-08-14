package com.ossdoctor.Repository;

import com.ossdoctor.Entity.LevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LevelRepository extends JpaRepository<LevelEntity,Long> {

}
