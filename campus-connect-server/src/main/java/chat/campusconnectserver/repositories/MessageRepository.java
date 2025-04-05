package chat.campusconnectserver.repositories;

import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.MessageState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m JOIN m.chat c WHERE c.id=:chatId")
    public List<Message> findByChatId(@Param("chatId")Long chatId);

    @Query("UPDATE Message m SET m.state = :newState WHERE m.chat.id = :chatId")
    @Modifying
    void setMessagesToSeenByChatId(@Param("chatId") Long chatId, @Param("newState") MessageState state);
}
