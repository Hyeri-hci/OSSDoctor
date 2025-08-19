package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    @Override
    Optional<UserEntity> findById(Long id);

    Optional<UserEntity> findByNickname(String nickname);

    // GitHub ID로 사용자 조회 (중복 가입 방지)
    Optional<UserEntity> findByGithubId(Long githubId);
}
