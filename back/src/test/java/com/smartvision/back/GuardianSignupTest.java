package com.smartvision.back;

import com.smartvision.back.dto.GuardianResponseDto;
import com.smartvision.back.dto.GuardianSignupRequestDto;
import com.smartvision.back.entity.Guardian;
import com.smartvision.back.entity.User;
import com.smartvision.back.repository.GuardianRepository;
import com.smartvision.back.repository.UserRepository;
import com.smartvision.back.service.GuardianService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

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

    private final String guardianId = "guardian001";
    private final String password = "secure123";

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
    void 보호자_로그인_성공() {
        GuardianResponseDto response = guardianService.login(guardianId, password);

        assertThat(response).isNotNull();
        assertThat(response.getGuardianId()).isEqualTo(guardianId);
    }

    @Test
    void 보호자_로그인_실패_비밀번호_오류() {
        assertThatThrownBy(() -> guardianService.login(guardianId, "wrongPass!"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("아이디 또는 비밀번호가 일치하지 않습니다");
    }

    @Test
    void 보호자_로그인_실패_아이디_없음() {
        assertThatThrownBy(() -> guardianService.login("wrongId", password))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("아이디 또는 비밀번호가 일치하지 않습니다");
    }
}
