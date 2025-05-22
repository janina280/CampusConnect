package chat.campusconnectserver.modal;

import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.payload.response.MessageResponse;
import chat.campusconnectserver.services.UserService;
import chat.campusconnectserver.util.FileUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageMapper {
    private final UserService userService;

    public MessageMapper(UserService userService) {
        this.userService = userService;
    }
    public List<MessageResponse> toMessagesResponse(List<Message> messages) {
        return messages.stream().map(message -> {
            try {
                return toMessageResponse(message);
            } catch (UserException e) {
                throw new RuntimeException("Failed to map message to response", e);
            }
        }).collect(Collectors.toList());
    }

    public MessageResponse toMessageResponse(Message message) throws UserException {
        return MessageResponse.builder()
                        .id(message.getId())
                        .content(message.getContent())
                        .senderId(String.valueOf(message.getSenderId()))
                        .sender(userService.getUserDtoById(message.getUser().getId()))
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
