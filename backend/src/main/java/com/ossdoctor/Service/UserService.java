package com.ossdoctor.Service;

import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.Entity.UserEntity;
import com.ossdoctor.Repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.json.JSONObject;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO save(UserDTO dto){
        return toDTO(userRepository.save(toEntity(dto)));
    }

    public Optional<UserDTO> findByGithubId(Long githubId) {
        return userRepository.findByGithubId(githubId)
                .map(this::toDTO);
    }

    /**
     * GitHub 사용자 정보를 데이터베이스에 저장 또는 업데이트
     * @param userJson GitHub API에서 받은 사용자 정보
     * @return 저장된 사용자 DTO
     */
    public UserDTO saveOrUpdateUserFromGithub(JSONObject userJson) {
        try {
            Long githubId = userJson.getLong("id");
            String nickname = userJson.getString("login");
            String avatarUrl = userJson.optString("avatar_url", null);
            String bio = userJson.optString("bio", null);

            System.out.println("GitHub 사용자 정보 처리:");
            System.out.println("- GitHub ID: " + githubId);
            System.out.println("- Nickname: " + nickname);
            System.out.println("- Avatar URL: " + avatarUrl);
            System.out.println("- Bio: " + bio);

            // 기존 사용자 확인
            Optional<UserDTO> existingUser = findByGithubId(githubId);

            if (existingUser.isPresent()) {
                // 기존 사용자 업데이트 - 기존 엔터티의 ID와 가입 시점 유지
                System.out.println("기존 사용자 정보 업데이트: " + nickname);
                UserDTO userDto = existingUser.get();
                userDto.setNickname(nickname);
                userDto.setAvatarUrl(avatarUrl);
                userDto.setBio(bio);
                // idx와 joinedAt은 그대로 유지
                return save(userDto);
            } else {
                // 신규 사용자 생성
                System.out.println("신규 사용자 생성: " + nickname);
                UserDTO newUser = UserDTO.builder()
                        .githubId(githubId)
                        .nickname(nickname)
                        .avatarUrl(avatarUrl)
                        .bio(bio)
                        .level(1)
                        .totalScore(0)
                        .build();
                return save(newUser);
            }
        } catch (Exception e) {
            System.err.println("사용자 정보 저장 중 오류 발생: " + e.getMessage());
            throw new RuntimeException("사용자 정보 저장 실패: " + e.getMessage(), e);
        }
    }

    private UserDTO toDTO(UserEntity entity) {
        return UserDTO.builder()
                .idx(entity.getIdx())
                .githubId(entity.getGithubId())
                .nickname(entity.getNickname())
                .avatarUrl(entity.getAvatarUrl())
                .bio(entity.getBio())
                .level(entity.getLevel())
                .totalScore(entity.getTotalScore())
                .joinedAt(entity.getJoinedAt())
                .build();
    }

    private UserEntity toEntity(UserDTO dto) {
        return UserEntity.builder()
                .idx(dto.getIdx()) // ID가 있으면 기존 엔터티로 인식 (UPDATE), 없으면 새 엔터티 (INSERT)
                .githubId(dto.getGithubId())
                .nickname(dto.getNickname())
                .avatarUrl(dto.getAvatarUrl())
                .bio(dto.getBio())
                .level(dto.getLevel())
                .totalScore(dto.getTotalScore())
                .joinedAt(dto.getJoinedAt()) // 기존 가입 시점 유지
                .build();
    }
}
