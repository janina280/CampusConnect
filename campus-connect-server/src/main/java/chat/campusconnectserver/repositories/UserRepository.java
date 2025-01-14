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
    @Query("SELECT u FROM User u WHERE u.name LIKE CONCAT('%', :query, '%') OR u.email LIKE CONCAT('%', :query, '%')")
    List<User> searchUser(@Param("query") String query);


}