package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SendMessageRequest {
    private Long userId;  // Expeditor
    private Long receiverId; // Destinatar
    private String content;
    private Long chatId;

    public SendMessageRequest() {}

    public SendMessageRequest(Long userId, Long receiverId, String content, Long chatId) {
        this.userId = userId;
        this.receiverId = receiverId;
        this.content = content;
        this.chatId=chatId;
    }

}
