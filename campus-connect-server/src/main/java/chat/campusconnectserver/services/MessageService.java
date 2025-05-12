package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.*;
import chat.campusconnectserver.payload.request.MessageRequest;
import chat.campusconnectserver.repositories.ChatRepository;
import chat.campusconnectserver.repositories.MessageRepository;
import chat.campusconnectserver.util.FileService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserService userService;
    private final MessageMapper mapper;
    private final ChatService chatService;
    private final ChatRepository chatRepository;
     private final FileService fileService;

    @Autowired
    public MessageService(MessageRepository messageRepository, UserService userService, MessageMapper mapper, ChatService chatService, ChatRepository chatRepository, FileService fileService) {
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.mapper = mapper;
        this.chatService = chatService;
        this.chatRepository = chatRepository;
         this.fileService = fileService;
    }

    public Message sendMessage(MessageRequest req, User user) throws UserException, ChatException {
        Chat chat = chatService.findChatById(req.getChatId());

        Message message = new Message();
        message.setChat(chat);
        message.setUser(user);
        message.setContent(req.getContent());

        message.setCreatedDate(LocalDateTime.now());

        String formattedTime = formatMessageTime(message.getCreatedDate());
        message.setFormattedTime(formattedTime);

        message.setSenderId(user.getId().toString());
        message.setType(req.getType());
        message.setState(MessageState.sent);
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

    @Transactional
    public List<Message> getChatsMessages(Long chatId, User reqUser) throws ChatException, UserException {
        Chat chat = chatService.findChatById(chatId);

        boolean isUserInChat = chat.getUsers()
                .stream()
                .anyMatch(u -> u.getId().equals(reqUser.getId()));

        if (!isUserInChat) {
            throw new UserException("You are not related to this chat " + chat.getId());
        }

        return messageRepository.findByChatId(chatId);
    }

    public Message findMessageById(Long messageId) throws MessageException {
        Optional<Message> opt = messageRepository.findById(messageId);
        if (opt.isPresent()) {
            return opt.get();
        }

        throw new MessageException("message not found with id" + messageId);
    }

    public void deleteMessage(Long messageId, User reqUser) throws MessageException, UserException {
        Message message = findMessageById(messageId);
        if (message.getUser().getId().equals(reqUser.getId())) {
            messageRepository.deleteById(messageId);
        }
        throw new UserException("You can't delete another user's message" + reqUser.getName());
    }

    public void uploadMediaMessage(String chatId, MultipartFile file, String messageType, User user) {
        Chat chat = chatRepository.findById(Long.valueOf(chatId))
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        final String senderId = String.valueOf(user.getId());
        final String filePath = fileService.saveFile(file, Long.valueOf(senderId));

        Message message = new Message();
        message.setSenderId(senderId);
        message.setState(MessageState.sent);
        message.setMediaFilePath(filePath);
        message.setChat(chat);

        MessageType type = MessageType.valueOf(messageType.toLowerCase());
        message.setType(type);

        messageRepository.save(message);
    }



    private Long getSenderId(Chat chat, Authentication authentication) {

        return chat.getSender().getId();
    }


    public Message markMessageAsStarred(Long messageId) {
        Message message =messageRepository.findById(messageId).orElseThrow(() ->
                new RuntimeException("Message not found"));
        if (!message.isStarred()) {
            message.setStarred(true);
            return messageRepository.save(message);
        }
        return message;
    }

}



