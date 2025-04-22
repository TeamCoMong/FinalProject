package com.studymate.back;

import com.studymate.back.dto.GuardianSignupRequestDto;
import com.studymate.back.entity.Guardian;
import com.studymate.back.entity.User;
import com.studymate.back.repository.GuardianRepository;
import com.studymate.back.repository.UserRepository;
import com.studymate.back.service.GuardianService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class GuardianSignupTest {

    @Autowired
    private GuardianService guardianService;

    @Autowired
    private GuardianRepository guardianRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        if (!userRepository.existsById("ABCD1234")) {
            User user = User.builder()
                    .userId("ABCD1234")
                    .name("테스트 사용자")
                    .build();
            userRepository.save(user);
        }
    }

    @Test
    void 보호자_회원가입_성공() {
        GuardianSignupRequestDto dto = new GuardianSignupRequestDto();
        dto.setGuardianId("guardian001");
        dto.setEmail("guardian@example.com");
        dto.setPassword("secure123");
        dto.setUserCode("ABCD1234");
        dto.setVerificationCode("123456"); // 생략된 로직용

        guardianService.signup(dto);

        assertThat(guardianRepository.findByGuardianId("guardian001")).isPresent();
    }

    @Test
    void 보호자_삭제_성공() {
        String guardianId = "guardian002";
        // when
        guardianService.deleteGuardian(guardianId);

        Guardian deletedGuardian = guardianRepository.findByGuardianId(guardianId).orElse(null);
        assertThat(deletedGuardian).isNull();
    }
}
