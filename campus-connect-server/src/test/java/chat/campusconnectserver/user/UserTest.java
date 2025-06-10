package chat.campusconnectserver.user;

import chat.campusconnectserver.models.User;
import chat.campusconnectserver.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserTest {
    @Autowired
    private UserRepository userRepository;
    @Test
    public void testUserQuery() {
        User newUser = new User();
        newUser.setName("Test User");
        newUser.setEmail("testuser@example.com");
        newUser.setNickname("testnickname");
        newUser.setAbout("Test about");


        User savedUser = userRepository.save(newUser);


        assertNotNull(savedUser);
        assertNotNull(savedUser.getId());
    }

}
