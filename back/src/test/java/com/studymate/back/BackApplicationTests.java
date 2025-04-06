package com.studymate.back;

import com.studymate.back.dto.UserResponseDto;
import com.studymate.back.entity.User;
import com.studymate.back.repository.UserRepository;
import com.studymate.back.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;


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

}
