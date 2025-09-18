package com.ossdoctor.config;

import com.ossdoctor.DTO.LevelDTO;
import com.ossdoctor.Service.LevelService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LevelDataInitializer implements CommandLineRunner {

    private final LevelService levelService;

    @Override
    public void run(String... args) throws Exception {
        List<LevelDTO> levels = List.of(
                LevelDTO.builder().levelId(1L).title("Newbie").requiredExp(0).build(),
                LevelDTO.builder().levelId(2L).title("Explorer").requiredExp(100).build(),
                LevelDTO.builder().levelId(3L).title("Advanced Contributor").requiredExp(300).build(),
                LevelDTO.builder().levelId(4L).title("Developer").requiredExp(600).build(),
                LevelDTO.builder().levelId(5L).title("Active Developer").requiredExp(1000).build(),
                LevelDTO.builder().levelId(6L).title("Maintainer").requiredExp(1500).build(),
                LevelDTO.builder().levelId(7L).title("Senior Maintainer").requiredExp(2100).build(),
                LevelDTO.builder().levelId(8L).title("Senior Maintainer").requiredExp(2800).build(),
                LevelDTO.builder().levelId(9L).title("OSS Leader").requiredExp(3600).build(),
                LevelDTO.builder().levelId(10L).title("OSS Doctor").requiredExp(4500).build()
        );

        levels.forEach(level -> {
            if (!levelService.existsByLevelId(level.getLevelId())) {
                levelService.save(level);
            }
        });

        log.info("Level data initialized via DTO.");
    }
}

