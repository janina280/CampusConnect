package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.*;
import chat.campusconnectserver.payload.MessageRequest;
import chat.campusconnectserver.repositories.ChatRepository;
import chat.campusconnectserver.repositories.MessageRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
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
   // private final FileService fileService;

    @Autowired
    public MessageService(MessageRepository messageRepository, UserService userService, MessageMapper mapper, ChatService chatService, ChatRepository chatRepository) {
        this.messageRepository = messageRepository;
        this.userService = userService;
        this.mapper = mapper;
        this.chatService = chatService;
        this.chatRepository = chatRepository;
       // this.fileService = fileService;
    }

    public void saveMessage(MessageRequest messageRequest) {
        Chat chat = chatRepository.findById(messageRequest.getChatId())
                .orElseThrow(() -> new EntityNotFoundException("Chat not found"));

        Message message = new Message();
        message.setContent(messageRequest.getContent());
        message.setChat(chat);
        message.setSenderId(String.valueOf(messageRequest.getSenderId()));
        message.setReceiverId(String.valueOf(messageRequest.getReceiverId()));
        message.setType(messageRequest.getType());
        message.setState(MessageState.sent);

        messageRepository.save(message);
    }

    public List<MessageResponse> findChatMessages(Long chatId) {
        return messageRepository.findByChatId(chatId)
                .stream()
                .map(mapper::toMessageResponse)
                .toList();
    }

    public Message sendMessage(MessageRequest req) throws UserException, ChatException {
        User user = userService.findUserById(req.getSenderId());
        Chat chat = chatService.findChatById(req.getChatId());

        Message message = new Message();
        message.setChat(chat);
        message.setUser(user);
        message.setContent(req.getContent());
        //message.setTimestamp(LocalDateTime.now());

       // String formattedTime = formatMessageTime(message.getTimestamp());
        //message.setFormattedTime(formattedTime);

        message = messageRepository.save(message);

        chat.getMessages().add(message);

        chatService.saveChat(chat);

        return message;
    }

    @Transactional
    public void setMessagesToSeen(Long chatId, Authentication authentication) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));
        final Long recipientId = getRecipientId(chat, authentication);

        messageRepository.setMessagesToSeenByChatId(chatId, MessageState.seen);

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

    public void uploadMediaMessage(Long chatId, MultipartFile file, Authentication authentication) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Chat not found"));

        final Long senderId = getSenderId(chat, authentication);
        final Long receiverId = getRecipientId(chat, authentication);

       // final String filePath = fileService.saveFile(file, senderId);
        Message message = new Message();
        message.setReceiverId(String.valueOf(receiverId));
        message.setSenderId(String.valueOf(senderId));
        message.setState(MessageState.sent);
        message.setType(MessageType.image);
      //  message.setMediaFilePath(filePath);
        message.setChat(chat);
        messageRepository.save(message);

    }

    private Long getSenderId(Chat chat, Authentication authentication) {
        if (chat.getSender().getId().equals(authentication.getName())) {
            return chat.getSender().getId();
        }
        return chat.getRecipient().getId();
    }

    private Long getRecipientId(Chat chat, Authentication authentication) {
        if (chat.getSender().getId().equals(authentication.getName())) {
            return chat.getRecipient().getId();
        }
        return chat.getSender().getId();
    }

}
