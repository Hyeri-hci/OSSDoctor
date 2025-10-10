package com.ossdoctor.DTO;

import lombok.Data;

@Data
public class GithubTreeFileResponseDTO{
    private String name;
    private String path;
    private String content;
    private String encoding;
    private String type;
    private Long size;
}
