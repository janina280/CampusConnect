package chat.campusconnectserver.modal;

import chat.campusconnectserver.util.FileUtils;
import org.springframework.stereotype.Service;

@Service
public class MessageMapper {
    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(String.valueOf(message.getSenderId()))
                .chatId(message.getChat().getId())
                .type(message.getType())
                .state(message.getState())
                .createdAt(message.getCreatedDate())
                .formattedTime(message.getFormattedTime())
                .media(FileUtils.readFileFromLocation(message.getMediaFilePath()))
                .build();
    }
}
