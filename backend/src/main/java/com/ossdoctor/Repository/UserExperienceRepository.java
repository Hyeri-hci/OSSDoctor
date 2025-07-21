package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserExperienceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserExperienceRepository extends JpaRepository<UserExperienceEntity, Long> {

}
