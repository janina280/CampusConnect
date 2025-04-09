package chat.campusconnectserver.modal;

import chat.campusconnectserver.dtos.UserDto;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageResponse {
    private Long id;
    private String content;
    private MessageType type;
    private MessageState state;
    private String senderId;
    private Long chatId;
    private LocalDateTime createdAt;
    private String formattedTime;
    private byte[] media;
    private UserDto sender;
}
