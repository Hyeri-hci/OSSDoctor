package com.ossdoctor.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiStatusDTO {
    private Boolean tokenValid;
    private RateLimitDTO rateLimit;
    private String error;
}
