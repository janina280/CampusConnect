package chat.campusconnectserver.dtos;

import chat.campusconnectserver.modal.Chat;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String content;
    private LocalDateTime timestamp;
    private User user ;
    private Chat chat;
    private String formattedTime;

    public MessageDto(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
        this.user = message.getUser();
        this.chat = message.getChat();
        this.formattedTime = message.getFormattedTime();
    }
}
