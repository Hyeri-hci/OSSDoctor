package com.ossdoctor.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
@RequiredArgsConstructor
public class WebClientConfig {

    private final GithubApiProperties properties;

    @Bean
    public WebClient webClient() {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, properties.getApi().getTimeoutSeconds() * 1000)
                .responseTimeout(Duration.ofSeconds(properties.getApi().getTimeoutSeconds()))
                .doOnConnected(connection ->
                        connection.addHandlerLast(new ReadTimeoutHandler(properties.getApi().getTimeoutSeconds(), TimeUnit.SECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(properties.getApi().getTimeoutSeconds(), TimeUnit.SECONDS)));

        return WebClient.builder()
                .baseUrl(properties.getApi().getBaseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }
}
