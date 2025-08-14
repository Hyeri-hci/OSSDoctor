package com.ossdoctor.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributorDTO {
    private String name;
    private int contributions;
    private String avatarUrl;
    private String htmlUrl;
    private String type;
}
