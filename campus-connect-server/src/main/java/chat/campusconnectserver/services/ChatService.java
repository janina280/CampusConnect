package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.Chat;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.repositories.ChatRepository;

import java.util.List;

public class ChatService {
private ChatRepository chatRepository;
private UserService userService;

public ChatService(ChatRepository chatRepository, UserService userService){
    this.chatRepository=chatRepository;
    this.userService=userService;
}
    public Chat createChat(User reqUser, Long userId2) throws UserException {
    User user=userService.findUserById(userId2);
            return null;
    }
    public Chat findChatById(Long chatId){
        return null;
    }
    public List<Chat> findAllChatByUserId(Long userId){
        return null;
    }

    public Chat deleteChat(Long chatId, Long userId){
        return null;
    }
}
