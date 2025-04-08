package chat.campusconnectserver.dtos;


import chat.campusconnectserver.modal.Message;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String content;
    private String senderId;
    private String receiverId;
    private String type;
    private String state;
    private LocalDateTime createdAt;
    private String media;

    public MessageDto(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.senderId = String.valueOf(message.getUser().getId());
       // this.receiverId = String.valueOf(message.getChat().getReceiver().getId());
        this.type = String.valueOf(message.getType());
        this.state = String.valueOf(message.getState());
        this.createdAt = message.getCreatedDate();// Or use the appropriate date/time format
        this.media = message.getMediaFilePath();
    }

}
