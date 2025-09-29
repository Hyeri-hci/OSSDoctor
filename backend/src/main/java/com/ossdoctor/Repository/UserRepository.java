package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    @Override
    Optional<UserEntity> findById(Long id);

    Optional<UserEntity> findByNickname(String nickname);

    // GitHub ID로 사용자 조회 (중복 가입 방지)
    Optional<UserEntity> findByGithubId(Long githubId);
    
    // 리더보드용 쿼리들
    // 총점 기준 상위 사용자 조회
    @Query("SELECT u FROM UserEntity u ORDER BY u.totalScore DESC")
    List<UserEntity> findTopUsersByScore(Pageable pageable);

    // 특정 점수보다 높은 점수를 가진 사용자 수 조회 (순위 계산용)
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.totalScore > :score")
    int countUsersWithHigherScore(@Param("score") Integer score);
}
