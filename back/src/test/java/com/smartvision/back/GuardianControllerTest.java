package com.studymate.back;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;  // 수정
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class GuardianControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void 보호자_로그인_성공() throws Exception {
        // 요청 객체 생성
        Map<String, String> requestMap = new HashMap<>();
        requestMap.put("guardianId", "guardian001");
        requestMap.put("password", "secure123");

        // 요청을 JSON 문자열로 변환
        String loginRequestJson = objectMapper.writeValueAsString(requestMap);

        // 요청 전송
        mockMvc.perform(
                        post("/api/guardians/login")  // 수정된 임포트
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(loginRequestJson)  // loginRequestJson 정의된 변수
                )
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.guardianId").value("guardian001"))
                .andExpect(jsonPath("$.userId").value("ABCD1234"));
    }
}
