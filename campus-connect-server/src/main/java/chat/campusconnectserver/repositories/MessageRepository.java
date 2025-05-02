package chat.campusconnectserver.repositories;

import chat.campusconnectserver.dtos.UserMessageCountDto;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.MessageState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m JOIN FETCH m.chat c WHERE c.id = :chatId")
    List<Message> findByChatId(@Param("chatId") Long chatId);

    @Query("UPDATE Message m SET m.state = :newState WHERE m.chat.id = :chatId")
    @Modifying
    void setMessagesToSeenByChatId(@Param("chatId") Long chatId, @Param("newState") MessageState state);


    @Query("SELECT new chat.campusconnectserver.dtos.UserMessageCountDto(" +
            "u.id, u.name, u.imageUrl, COUNT(m)) " +
            "FROM Message m JOIN m.user u " +
            "GROUP BY u.id, u.name, u.imageUrl " +
            "ORDER BY COUNT(m) DESC")
    List<UserMessageCountDto> findTopUsersByMessageCount(org.springframework.data.domain.Pageable pageable);

}
