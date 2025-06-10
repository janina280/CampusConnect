package chat.campusconnectserver.payloads.request;

import chat.campusconnectserver.models.MessageType;
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
    private String media;
}
