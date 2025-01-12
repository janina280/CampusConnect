package chat.campusconnectserver.repositories;

import chat.campusconnectserver.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
    @Query( value = "SELECT u FROM users u where u.name Like %:query% or u.email Like %:query% ", nativeQuery=true)

    public List<User>searchUser(@Param("query") String query);

}