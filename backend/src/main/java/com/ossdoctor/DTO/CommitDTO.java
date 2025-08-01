package com.ossdoctor.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommitDTO {
    private String date;      // yyyy-MM-dd 형식 문자열
    private int commits;      // 그 날짜의 커밋 수
    private String day;
}