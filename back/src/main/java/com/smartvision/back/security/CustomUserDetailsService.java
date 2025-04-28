package com.smartvision.back.security;

import com.smartvision.back.entity.User;
import com.smartvision.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * CustomUserDetailsService
 * - Spring Security에서 사용자 인증을 위한 UserDetailsService 구현
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * 사용자 아이디(name)로 사용자 정보 조회
     * @param name 사용자 아이디
     * @return UserDetails (Spring Security에서 관리하는 사용자 객체)
     * @throws UsernameNotFoundException 사용자가 없을 경우 예외 발생
     */
    @Override
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        User user = userRepository.findByName(name)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + name));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getName())
                .password(user.getPassword()) // BCrypt로 암호화된 비밀번호 사용
                .roles("USER") // 기본 권한 부여
                .build();
    }
}
