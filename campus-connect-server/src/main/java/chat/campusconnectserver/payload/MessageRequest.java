package chat.campusconnectserver.payload;

import chat.campusconnectserver.modal.MessageType;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageRequest {
    private String content;
    private Long chatId;
    private MessageType type;
    private String jwtString;

}
