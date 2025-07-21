package com.ossdoctor.DTO;

import com.ossdoctor.Entity.SOURCE_TYPE;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryDTO {
    private Long idx;
    private Long githubRepoId;
    private String name;
    private String url;
    private String owner;
    private String language;
    private SOURCE_TYPE sourceType;
    private String license;
    private int star;
    private int fork;
    private int watchers;
    private int contributors;
}
