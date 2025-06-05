package chat.campusconnectserver.user;

import chat.campusconnectserver.models.User;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class UserRepositoryTest {
    @Autowired
    private EntityManager entityManager;

    @Test
    public void testUserQuery() {
        User user = entityManager.createQuery("SELECT u FROM User u WHERE u.id = :id", User.class)
                .setParameter("id", 1L)
                .getSingleResult();
        assertNotNull(user);
    }

    @Test
    @Transactional
    public void testUserQueryCreate() {
        User newUser = new User();
        newUser.setName("Test User");
        newUser.setEmail("testuser@example.com");
        newUser.setNickname("testnickname");
        newUser.setAbout("Test about");


        entityManager.persist(newUser);
        entityManager.flush();


        User user = entityManager.createQuery("SELECT u FROM User u WHERE u.id = :id", User.class)
                .setParameter("id", newUser.getId())
                .getSingleResult();


        assertNotNull(user);


        assertEquals("Test User", user.getName());
        assertEquals("testuser@example.com", user.getEmail());
        assertEquals("testnickname", user.getNickname());
        assertEquals("Test about", user.getAbout());
    }
}
