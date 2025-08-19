package com.ossdoctor.Service;

import com.ossdoctor.DTO.TopicDTO;
import com.ossdoctor.Entity.TopicEntity;
import com.ossdoctor.Repository.RepositoryRepository;
import com.ossdoctor.Repository.TopicRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final RepositoryRepository repositoryRepository;

    private TopicDTO save(TopicDTO TopicDTO) {
        return toDTO(topicRepository.save(toEntity(TopicDTO)));
    }

    private TopicDTO toDTO(TopicEntity entity) {
        return TopicDTO.builder()
                .idx(entity.getIdx())
                .repositoryId(entity.getRepository().getIdx())
                .topic(entity.getTopic())
                .build();
    }

    private TopicEntity toEntity(TopicDTO dto) {
        return TopicEntity.builder()
                .repository(repositoryRepository.findById(dto.getRepositoryId()).get())
                .topic(dto.getTopic())
                .build();
    }
}
