package com.smartvision.back.config;

import com.smartvision.back.Location.LocationWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(locationHandler(), "/location")
                .setAllowedOrigins("*"); // 또는 "http://localhost:8081" 등 클라이언트 주소 명시
    }

    @Bean
    public WebSocketHandler locationHandler() {
        return new LocationWebSocketHandler();
    }
}