package com.smartvision.back;

import com.smartvision.back.dto.UserResponseDto;
import com.smartvision.back.dto.UserSignupRequestDto;
import com.smartvision.back.dto.UserSignupResponseDto;
import com.smartvision.back.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BackApplicationTests {

    @Autowired
    private UserService userService;

    @Test
    void 사용자_생성_성공() {
        // given
        UserSignupRequestDto requestDto = UserSignupRequestDto.builder()
                .name("테스트 사용자")
                .build();

        // when
        UserSignupResponseDto responseDto = userService.signup(requestDto);

        // then
        assertThat(responseDto).isNotNull();
        assertThat(responseDto.getUserId()).isNotBlank();
        assertThat(responseDto.getName()).isEqualTo("테스트 사용자");

        System.out.println("✅ 생성된 사용자 코드: " + responseDto.getUserId());
    }

    @Test
    void 사용자_목록_조회_성공() {
        // when
        List<UserResponseDto> userList = userService.getAllUsers();

        // then
        assertThat(userList).isNotNull();
        assertThat(userList.size()).isGreaterThan(0); // 최소 1명 이상 있다고 가정
        System.out.println("조회된 사용자 수: " + userList.size());
        userList.forEach(user -> System.out.println("userId: " + user.getUserId()));
    }

    @Test
    void 사용자_삭제_성공() {
        // given
        String userId = "9400F9FE";

        // when
        userService.deleteUser(userId);

        // then
        boolean exists = userService.existsByUserId(userId);
        assertThat(exists).isFalse();
    }

    @Test
    void 사용자_회원가입_성공() {
        // given
        UserSignupRequestDto request = UserSignupRequestDto.builder()
                .name("테스트 사용자")
                .build();

        // when
        UserSignupResponseDto response = userService.signup(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isNotBlank();
        assertThat(response.getName()).isEqualTo("테스트 사용자");

        System.out.println("✅ 회원가입 완료 - 사용자 코드: " + response.getUserId());
    }

    @Test
    void 사용자_로그인_성공() {
        // 테스트용 사용자 ID
        String userId = "ABCD1234";

        // 로그인 메소드 호출
        UserResponseDto response = userService.login(userId);

        // 반환된 응답을 검증
        assertThat(response).isNotNull();
        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getName()).isNotNull();  // 이름이 있는지 확인
    }
}
