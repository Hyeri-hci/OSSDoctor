package com.ossdoctor.DTO;

import lombok.Data;
import java.util.List;

@Data
public class GithubTreeResponseDTO {
    private List<GithubTreeNodeDTO> tree;
    private boolean truncated;
}
