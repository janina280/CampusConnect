package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.Chat;
import chat.campusconnectserver.model.Message;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.payload.SendMessageRequest;
import chat.campusconnectserver.repositories.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final ChatService chatService;

    @Autowired
    public MessageService(MessageRepository messageRepository, UserService userService, ChatService chatService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.chatService = chatService;
    }

    public Message sendMessage(SendMessageRequest req) throws UserException, ChatException {
        User user = userService.findUserById(req.getUserId());
        Chat chat = chatService.findChatById(req.getChatId());

        Message message = new Message();
        message.setChat(chat);
        message.setUser(user);
        message.setContent(req.getContent());
        message.setTimestamp(LocalDateTime.now());

        String formattedTime = formatMessageTime(message.getTimestamp());
        message.setFormattedTime(formattedTime);

        message = messageRepository.save(message);

        chat.getMessages().add(message);

        chatService.saveChat(chat);

        return message;
    }

    public String formatMessageTime(LocalDateTime timestamp) {
        LocalDateTime now = LocalDateTime.now();
        long hoursDiff = ChronoUnit.HOURS.between(timestamp, now);

        if (hoursDiff > 24) {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            return timestamp.format(dateFormatter);
        } else {
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
            return timestamp.format(timeFormatter);
        }
    }

    public List<Message> getChatsMessages(Long chatId, User reqUser) throws ChatException, UserException {
        Chat chat = chatService.findChatById(chatId);

        if (!chat.getUsers().contains(reqUser)) {
            throw new UserException("You are not releted to this chat" + chat.getId());
        }

        List<Message> messages = messageRepository.findByChatId(chatId);

        return messages;
    }

    public Message findMessageById(Long messageId) throws MessageException {
        Optional<Message> opt = messageRepository.findById(messageId);
        if (opt.isPresent()) {
            return opt.get();
        }

        throw new MessageException("message not found with id" + messageId);
    }

    public void deleteMessage(Long messageId, User reqUser) throws MessageException, UserException {
    Message message=findMessageById(messageId);
    if(message.getUser().getId().equals(reqUser.getId())){
        messageRepository.deleteById(messageId);
    }
    throw new UserException("You can't delete another user's message"+reqUser.getName());
    }

}
