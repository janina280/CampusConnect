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
    private Boolean isStarred;
    private String media;
    private String formattedTime;

    public MessageDto(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.senderId = String.valueOf(message.getUser().getId());
        this.type = String.valueOf(message.getType());
        this.state = String.valueOf(message.getState());
        this.isStarred = message.isStarred();
        this.createdAt = message.getCreatedDate();
        this.media = message.getMediaFilePath();
        this.formattedTime = message.getFormattedTime();
    }

}
