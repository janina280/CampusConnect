package chat.campusconnectserver.services;

import chat.campusconnectserver.dtos.ChatDto;
import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.models.Chat;
import chat.campusconnectserver.models.Role;
import chat.campusconnectserver.models.User;
import chat.campusconnectserver.payloads.request.GroupChatRequest;
import chat.campusconnectserver.repositories.ChatRepository;
import chat.campusconnectserver.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Autowired
    public ChatService(ChatRepository chatRepository, UserRepository userRepository, UserService userService) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public ChatDto createChat(Long firstUserId, Long secondUserId) throws UserException {
        if (firstUserId.equals(secondUserId)) {
            throw new UserException("You cannot create a chat with yourself.");
        }
        User firstUser = userService.findUserById(firstUserId);
        User secondUser = userService.findUserById(secondUserId);

        Chat isChatExist = chatRepository.findSingleChatByUserIds(secondUser, Optional.ofNullable(firstUser));
        if (isChatExist != null) {
            return new ChatDto(isChatExist);
        }
        Chat chat = new Chat();
        chat.setCreatedBy(firstUser);
        chat.getUsers().add(secondUser);
        chat.getUsers().add(firstUser);
        chat.setGroup(false);

        chatRepository.save(chat);
        return new ChatDto(chat);
    }

    public Chat findChatById(Long chatId) throws ChatException {
        Optional<Chat> chat = chatRepository.findWithUsersById(chatId);
        if (chat.isPresent()) {
            return chat.get();
        }
        throw new ChatException("Chat not found with id " + chatId);
    }

    public List<ChatDto> findAllChatByUserId(Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }
        return chatRepository.findChatByUserIds(user).stream().map(ChatDto::new).toList();
    }

    public List<ChatDto> findAllGroupChats(Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }

        return chatRepository.findGroupChatsByUser(user).stream().map(ChatDto::new).toList();
    }

    public List<ChatDto> searchGroupByName(String groupName, Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }

        return chatRepository.findAllGroupChats().stream()
                .filter(chat -> chat.isGroup()
                        && chat.getName().toLowerCase().contains(groupName.toLowerCase())
                        && chat.getUsers().contains(user)).map(ChatDto::new).toList();
    }

    public ChatDto createGroup(GroupChatRequest req, User reqUser) throws UserException {
        boolean isTutorOrAdmin = reqUser.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.RoleName.ROLE_TUTOR || role.getName() == Role.RoleName.ROLE_ADMIN);
        if (!isTutorOrAdmin) {
            throw new UserException("You do not have permission to create a group. Only tutors or admins can create groups.");
        }
        Chat group = new Chat();
        group.setGroup(true);
        group.setImg(req.getChat_image());
        group.setName(req.getChat_name());
        group.setCreatedBy(reqUser);
        group.getAdmins().add(reqUser);
        if (req.getUserIds() == null || req.getUserIds().isEmpty()) {
            throw new UserException("At least one user must be added to the group.");
        }
        group.getUsers().add(reqUser);
        for (Long userId : req.getUserIds()) {
            User user = userService.findUserById(userId);
            group.getUsers().add(user);
        }
        try {
            chatRepository.save(group);
        } catch (Exception e) {
            System.err.println("Error saving group: " + e.getMessage());
            throw new RuntimeException("Failed to create group", e);
        }
        return new ChatDto(group);
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

    public void deleteChatForUser(Long chatId, Long userId) throws UserException, ChatException {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatException("Chat not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));

        if (!chat.getUsers().contains(user)) {
            throw new UserException("User is not part of this chat");
        }
        chat.getUsers().remove(user);
        chatRepository.save(chat);
    }


    public Chat saveChat(Chat chat) {
        return chatRepository.save(chat);
    }

    public Chat removeFromGroup(Long chatId, Long userId, User reqUser) throws UserException, ChatException {
        Optional<Chat> opt = chatRepository.findById(chatId);
        User user = userService.findUserById(userId);

        if (opt.isEmpty()) {
            throw new ChatException("Chat not found with id " + chatId);
        }

        Chat chat = opt.get();

        boolean hasPrivilegedRole = reqUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals(Role.RoleName.ROLE_ADMIN) ||
                        role.getName().equals(Role.RoleName.ROLE_TUTOR));

        if (hasPrivilegedRole) {
            chat.getUsers().remove(user);
            chat.getAdmins().remove(user);
            return chatRepository.save(chat);
        }

        if (reqUser.getId().equals(user.getId())) {
            chat.getUsers().remove(user);
            chat.getAdmins().remove(user);
            return chatRepository.save(chat);
        }

        throw new UserException("You can't remove another user");
    }

    public ChatDto addUserToGroup(Long userId, Long chatId, User reqUser) throws UserException, ChatException {
        Optional<Chat> opt = chatRepository.findById(chatId);
        User user = userService.findUserById(userId);

        if (opt.isPresent()) {
            Chat chat = opt.get();

            boolean isAdmin = reqUser.getRoles().stream()
                    .anyMatch(role -> role.getName().equals(Role.RoleName.ROLE_ADMIN));

            boolean isCreatorTutor = chat.getCreatedBy().getId().equals(reqUser.getId()) &&
                    reqUser.getRoles().stream()
                            .anyMatch(role -> role.getName().equals(Role.RoleName.ROLE_TUTOR));

            if (isAdmin || isCreatorTutor) {
                chat.getUsers().add(user);
                Chat updatedChat = chatRepository.save(chat);

                return new ChatDto(updatedChat.getId(), updatedChat.getName(), updatedChat.getUsers(), updatedChat.getMessages());
            } else {
                throw new UserException("You are not authorized to add users to this group");
            }
        }

        throw new ChatException("Chat not found with id " + chatId);
    }

    public List<ChatDto> findCommonGroups(Long userId1, Long userId2) throws UserException {
        List<ChatDto> user1Groups = findAllGroupChats(userId1);
        List<ChatDto> user2Groups = findAllGroupChats(userId2);

        return user1Groups.stream()
                .filter(user2Groups::contains)
                .toList();
    }

    public Set<User> getUsersInGroup(Long chatId) throws ChatException {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatException("Chat not found"));
        return chat.getUsers();
    }

    @Transactional
    public void pinChat(Long chatId, Long userId) throws ChatException, UserException {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatException("Chat not found"));
        User user = userService.findUserById(userId);

        if (!chat.getUsers().contains(user)) {
            throw new ChatException("User not part of this chat");
        }

        chat.setPinned(true);
        chatRepository.save(chat);
    }

    public void unpinChat(Long chatId, Long userId) throws ChatException, UserException {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatException("Chat not found"));
        User user = userService.findUserById(userId);

        if (!chat.getUsers().contains(user)) {
            throw new ChatException("User not part of this chat");
        }

        chat.setPinned(false);
        chatRepository.save(chat);
    }

    public List<ChatDto> findAllGroupsForAdmin(Long userId) throws UserException {
        User user = userService.findUserById(userId);
        if (user == null) {
            throw new UserException("User not found with ID: " + userId);
        }
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> role.getName() == Role.RoleName.ROLE_ADMIN);

        if (!isAdmin) {
            throw new UserException("Only admins can view all groups");
        }

        return chatRepository.findAllGroupChats().stream()
                .map(ChatDto::new)
                .collect(Collectors.toList());
    }


}
