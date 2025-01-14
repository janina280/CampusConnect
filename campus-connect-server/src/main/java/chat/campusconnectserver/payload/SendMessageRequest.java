package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendMessageRequest {
    private  Long userId;
    private Long chatId;
    private String content;
    public SendMessageRequest(Long userId, Long chatId, String content) {
        this.userId = userId;
        this.chatId = chatId;
        this.content = content;
    }
public  SendMessageRequest(){}

}
