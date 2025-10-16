package com.ossdoctor.controller;

import com.ossdoctor.DTO.*;
import com.ossdoctor.Service.UserBadgeService;
import com.ossdoctor.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/badge")
@RequiredArgsConstructor
public class BadgeController {

    private final UserService userService;
    private final UserBadgeService userBadgeService;

    @GetMapping("/all-badges/{nickname}")
    public Mono<ResponseEntity<Map<String, Object>>> getAllBadges(@PathVariable String nickname) {

        return Mono.fromCallable(() -> {
            Optional<UserDTO> userOpt = userService.findByUsername(nickname);
            if (userOpt.isEmpty()) {
                log.warn("전체 뱃지 조회 - 사용자를 찾을 수 없어서 기본 사용자 생성: {}", nickname);
                createDefaultUser(nickname);
                return nickname;
            } else {
                return nickname;
            }
        })
        .flatMap(userBadgeService::getAllBadgesWithEarned)
        .map(allBadges -> ResponseEntity.ok().body(Map.of(
                "success", true,
                "data", allBadges
        )))
        .onErrorReturn(ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "전체 뱃지 이력을 불러올 수 없습니다."
        )));
    }


    /**
     * 기본 사용자 생성
     */
    private UserDTO createDefaultUser(String nickname) {
        try {
            UserDTO newUser = UserDTO.builder()
                    .nickname(nickname)
                    .level(1)
                    .totalScore(0)
                    .build();

            return userService.save(newUser);
        } catch (Exception e) {
            log.error("기본 사용자 생성 실패: {}", e.getMessage(), e);
            // 생성에 실패하면 메모리상의 기본 객체 반환
            return UserDTO.builder()
                    .nickname(nickname)
                    .level(1)
                    .totalScore(0)
                    .build();
        }
    }
}
