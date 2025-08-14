package com.ossdoctor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "github")
public class GithubApiProperties {

    private String token;

    private Api api = new Api();

    @Data
    public static class Api {
        private String baseUrl = "https://api.github.com";
        private String graphqlUrl = "https://api.github.com/graphql";

        private int rateLimitMaxRetries = 3;
        private int cacheExpiryMinutes = 10;
        private int timeoutSeconds = 30;
    }
}
