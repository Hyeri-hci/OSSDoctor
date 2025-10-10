package com.ossdoctor.DTO;

import lombok.Data;

@Data
public class GithubTreeNodeDTO {
    private String path;
    private String mode;
    private String type;
    private String sha;
    private Long size;
    private String url;
}
