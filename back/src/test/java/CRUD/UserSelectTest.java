package CRUD;

import com.studymate.back.entity.User;
import com.studymate.back.repository.UserRepository;
import groovy.util.logging.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
@SpringBootTest
@Slf4j
public class UserSelectTest {
    @Autowired
    UserRepository userRepository;

    @Test
    void testUserSelect() {
        List<User> userList = userRepository.findAll();
        assertNotNull(userList);
        userList.forEach(System.out::println);
    }


}
