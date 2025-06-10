package chat.campusconnectserver.repositories;

import chat.campusconnectserver.models.Chat;
import chat.campusconnectserver.models.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    @Query("SELECT c FROM Chat c WHERE :user MEMBER OF c.users AND c.isGroup = false")
    public List<Chat> findChatByUserIds(@Param("user") User user);

    @Query("SELECT c FROM Chat c WHERE c.isGroup = true")
    public List<Chat> findAllGroupChats();

    @Query("SELECT c FROM Chat c WHERE c.isGroup = true AND :user MEMBER OF c.users")
    List<Chat> findGroupChatsByUser(@Param("user") User user);

    @Query("SELECT c FROM Chat c WHERE c.isGroup = false AND :user MEMBER OF c.users AND :reqUser MEMBER OF c.users")
    public Chat findSingleChatByUserIds(@Param("user") User user, @Param("reqUser") Optional<User> reqUser);

    @EntityGraph(attributePaths = "users")
    @Query("SELECT c FROM Chat c WHERE c.id = :id")
    Optional<Chat> findWithUsersById(@Param("id") Long id);

}
