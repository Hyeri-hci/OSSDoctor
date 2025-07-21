package com.ossdoctor.Repository;

import com.ossdoctor.Entity.UserEntity;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class UserRepositoryTest {
    @Autowired
    UserRepository userRepository;

    @Test
    void insertTest(){
        UserEntity user = UserEntity.builder()
                .githubId(12345L)
                .nickname("david")
                .avatarUrl("http://avatar.url")
                .bio("bio text")
                .level(1)
                .totalScore(100)
                .build();

        userRepository.save(user);

        System.out.println("user: " + userRepository.findById(user.getIdx()));
    }
}