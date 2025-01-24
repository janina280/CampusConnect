package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.Chat;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.payload.GroupChatRequest;
import chat.campusconnectserver.repositories.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ChatRepository chatRepository;

    private final UserService userService;

    @Autowired
    public ChatService(ChatRepository chatRepository, UserService userService) {
        this.chatRepository = chatRepository;
        this.userService = userService;
    }

    public Chat createChat(Long firstUserId, Long secondUserId) throws UserException {
        User firstUser = userService.findUserById(firstUserId);
        User secondUser = userService.findUserById(secondUserId);

        Chat isChatExist = chatRepository.findSingleChatByUserIds(secondUser, Optional.ofNullable(firstUser));
        if (isChatExist != null) {
            return isChatExist;
        }
        Chat chat = new Chat();
        chat.setCreatedBy(firstUser);
        chat.getUsers().add(secondUser);
        chat.getUsers().add(firstUser);
        chat.setGroup(false);

        chatRepository.save(chat);
        return chat;
    }

    public Chat findChatById(Long chatId) throws ChatException {
        Optional<Chat> chat = chatRepository.findById(chatId);
        if (chat.isPresent()) {
            return chat.get();
        }
        throw new ChatException("Chat not found with id" + chatId);
    }

    public List<Chat> findAllChatByUserId(Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }
        List<Chat> chats = chatRepository.findChatByUserIds(user.getId());
        return chats;
    }


    public List<Chat> findAllGroupChats(Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }
        List<Chat> groupChats = chatRepository.findAllGroupChats();

        return groupChats;
    }
    public List<Chat> searchGroupByName(String groupName, Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }
        return chatRepository.findAllGroupChats().stream()
                .filter(chat -> chat.getName().toLowerCase().contains(groupName.toLowerCase()) &&
                        chat.getUsers().contains(user))
                .toList();
    }


    public Chat createGroup(GroupChatRequest req, User reqUser) throws UserException {
        Chat group = new Chat();
        group.setGroup(true);
        group.setImg(req.getChat_image());
        group.setName(req.getChat_name());
        group.setCreatedBy(reqUser);
        group.getAdmins().add(reqUser);

        for (Long userId : req.getUserIds()) {
            User user = userService.findUserById(userId);
            group.getUsers().add(user);
        }
        chatRepository.save(group);
        return group;
    }

    public Chat renameGroup(Long chatId, String groupName, User reqUserId) throws UserException, ChatException {
        Optional<Chat> opt = chatRepository.findById(chatId);
        if (opt.isPresent()) {
            Chat chat = opt.get();
            if (chat.getUsers().contains(reqUserId)) {
                chat.setName(groupName);
                return chatRepository.save(chat);
            }
            throw new UserException("You are not member of this group");
        }
        throw new ChatException("Chat not found with id" + chatId);
    }

    public void deleteChat(Long chatId, Long userId) {
        Optional<Chat> opt = chatRepository.findById(chatId);
        if (opt.isPresent()) {
            Chat chat = opt.get();
            chatRepository.deleteById(chat.getId());
        }
    }

    public Chat removeFromGroup(Long chatId, Long userId, User reqUser) throws UserException, ChatException {
        Optional<Chat> opt = chatRepository.findById(chatId);
        User user = userService.findUserById(userId);
        if (opt.isPresent()) {
            Chat chat = opt.get();
            if (chat.getAdmins().contains(reqUser)) {
                chat.getUsers().remove(user);
                return chatRepository.save(chat);
            } else if (chat.getUsers().contains(reqUser)) {
                if (user.getId().equals(reqUser.getId())) {
                    chat.getUsers().remove(user);
                    return chatRepository.save(chat);
                }
            }
            throw new UserException("You can't remove another user");
        }
        throw new ChatException("Chat not found with id" + chatId);
    }

    public Chat addUserToGroup(Long userId, Long chatId, User reqUser) throws UserException, ChatException {
        Optional<Chat> opt = chatRepository.findById(chatId);
        User user = userService.findUserById(userId);
        if (opt.isPresent()) {
            Chat chat = opt.get();
            if (chat.getAdmins().contains(reqUser)) {
                chat.getUsers().add(user);
                return chatRepository.save(chat);
            } else {
                throw new UserException("You are not admin");
            }
        }
        throw new ChatException("Chat not found with id" + chatId);
    }
}
