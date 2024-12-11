package chat.campusconnectserver.chat;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
@Id
    private String Id;
private String chatId;
private String senderId;
private String recipientId;
private String content;
private Data timestamp;

}
