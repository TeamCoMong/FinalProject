// YoloResultControllerTest.java
package com.smartvision.back;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartvision.back.controller.YoloResultController;
import com.smartvision.back.dto.YoloResultDto;
import com.smartvision.back.dto.YoloResultDto.Detection;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest
@AutoConfigureMockMvc
class YoloResultControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void yoloResult_shouldBeReceivedSuccessfully() throws Exception {
        // Given: 테스트용 DTO 객체
        YoloResultDto dto = new YoloResultDto(
                "raspi001",
                "2025-05-28T12:00:00Z",
                List.of(
                        new Detection("person", 0.91),
                        new Detection("dog", 0.88)
                )
        );

        // When & Then: JSON 요청 → 응답 코드 200 & 메시지 확인
        mockMvc.perform(post("/api/yolo-results")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("YOLO 결과 수신 완료"));
    }
}
