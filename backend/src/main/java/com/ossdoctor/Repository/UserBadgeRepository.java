package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserBadgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadgeEntity, Long> {

}
