package chat.campusconnectserver.payload;

import chat.campusconnectserver.modal.MessageType;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageRequest {
    private Long senderId;  // Expeditor
    private Long receiverId; // Destinatar
    private String content;
    private Long chatId;
    private MessageType type;

}
