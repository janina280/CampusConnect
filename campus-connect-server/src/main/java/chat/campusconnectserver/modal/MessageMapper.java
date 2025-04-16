package chat.campusconnectserver.modal;

import chat.campusconnectserver.dtos.UserDto;
import chat.campusconnectserver.util.FileUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageMapper {
    public List<MessageResponse> toMessagesResponse(List<Message> messages) {
        return messages.stream().map(this::toMessageResponse).collect(Collectors.toList());
    }

    public MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                        .id(message.getId())
                        .content(message.getContent())
                        .senderId(String.valueOf(message.getSenderId()))
                        .sender(new UserDto(message.getUser()))
                        .chatId(message.getChat().getId())
                        .type(message.getType())
                        .starred(message.isStarred())
                        .state(message.getState())
                        .createdAt(message.getCreatedDate())
                        .formattedTime(message.getFormattedTime())
                        .media(FileUtils.readFileFromLocation(message.getMediaFilePath()))
                        .isGroup(message.getChat().isGroup())
                        .build();
    }
}
