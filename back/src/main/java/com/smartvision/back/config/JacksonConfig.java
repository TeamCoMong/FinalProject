package com.smartvision.back.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // ✅ 한글 이스케이프 방지 (예: \uAC00 → "가")
        mapper.configure(JsonGenerator.Feature.ESCAPE_NON_ASCII, false);
        return mapper;
    }
}