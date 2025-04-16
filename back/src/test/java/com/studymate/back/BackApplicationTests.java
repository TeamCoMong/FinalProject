package com.studymate.back;

import com.studymate.back.dto.SignupRequestDto;
import com.studymate.back.dto.UserResponseDto;
import com.studymate.back.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;


@SpringBootTest
class BackApplicationTests {
    @Autowired
    private UserService userService;

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
    void 사용자_생성_성공() {
        // given
        SignupRequestDto requestDto = SignupRequestDto.builder()
                .userId("testuser1")
                .password("testpass123")
                .name("테스트 유저")
                .phone("01012345678")
                .userType("DISABLED")
                .build();

        // when
        userService.signup(requestDto);

        // then
        UserResponseDto savedUser = userService.getUserByUserId("testuser1");
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getUserId()).isEqualTo("testuser1");
    }

    @Test
    void 사용자_정보_수정_성공() {
        // given
        String userId = "testuser1";
        String newPhone = "01099998888";

        // when
        userService.updatePhone(userId, newPhone);

        // then
        UserResponseDto updatedUser = userService.getUserByUserId(userId);
        assertThat(updatedUser.getPhone()).isEqualTo(newPhone);
    }
    @Test
    void 사용자_삭제_성공() {
        // given
        String userId = "testuser1";

        // when
        userService.deleteUser(userId);

        // then
        boolean exists = userService.existsByUserId(userId);
        assertThat(exists).isFalse();
    }



}
