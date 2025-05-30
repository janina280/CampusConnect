package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.*;
import chat.campusconnectserver.payload.request.MessageRequest;
import chat.campusconnectserver.repositories.MessageRepository;
import chat.campusconnectserver.util.FileService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
    private final ChatService chatService;
    private final FileService fileService;

    @Autowired
    public MessageService(MessageRepository messageRepository, ChatService chatService, FileService fileService) {
        this.messageRepository = messageRepository;
        this.chatService = chatService;
        this.fileService = fileService;
    }

    public Message sendMessage(MessageRequest req, User user) throws  ChatException {
        Chat chat = chatService.findChatById(req.getChatId());

        Message message = new Message();
        message.setChat(chat);
        message.setUser(user);
        message.setContent(req.getContent());
        message.setMediaFilePath(req.getMedia());

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

    public String uploadMediaMessage(MultipartFile file, User user) {
        return fileService.saveFile(file, Long.valueOf(user.getId().toString()));
    }

    public byte[] getMediaMessage(String filePath, User user) {
        return fileService.getFile(user.getId(), filePath);
    }


    public Message markMessageAsStarred(Long messageId) {
        Message message = messageRepository.findById(messageId).orElseThrow(() ->
                new RuntimeException("Message not found"));
        if (!message.isStarred()) {
            message.setStarred(true);
            return messageRepository.save(message);
        }
        return message;
    }

    public List<Message> getSharedMessagesForChat(Long chatId) {
        return messageRepository.findSharedMessagesByChatId(chatId);
    }

    public long countSharedMedia(Long chatId) {
        return messageRepository.countMediaItems(chatId);
    }

    public List<Message> getLast3ImagesByChatId(Long chatId) {
        Pageable pageable = PageRequest.of(0, 3);
        return messageRepository.findByChatIdAndTypeOrderByTimestampDesc(chatId, MessageType.image, pageable);
    }

}



