package chat.campusconnectserver.repositories;

import chat.campusconnectserver.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    Boolean existsByEmail(String email);
    @Query( value = "SELECT * FROM users u where u.name Like %:query% or u.email Like %:query% ", nativeQuery=true)
    public List<User>searchUser(@Param("query") String query);

}