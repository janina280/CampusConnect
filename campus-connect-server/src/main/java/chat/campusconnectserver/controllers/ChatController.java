package chat.campusconnectserver.controllers;

import chat.campusconnectserver.dtos.ChatDto;
import chat.campusconnectserver.dtos.UserDto;
import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.Chat;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.payload.AddUserInGroupRequest;
import chat.campusconnectserver.payload.ApiResponse;
import chat.campusconnectserver.payload.GroupChatRequest;
import chat.campusconnectserver.payload.SingleChatRequest;
import chat.campusconnectserver.security.TokenProvider;
import chat.campusconnectserver.services.ChatService;
import chat.campusconnectserver.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class ChatController {
    private final ChatService chatService;
    private final UserService userService;

    private final TokenProvider tokenProvider;

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public ChatController(ChatService chatService, UserService userService, TokenProvider tokenProvider, SimpMessagingTemplate simpMessagingTemplate) {
        this.chatService = chatService;
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Transactional
    @MessageMapping("/chat-create")
    //@SendTo("/chat/chat-create-response")
    public ChatDto createChatHandle(@RequestBody SingleChatRequest singleChatRequest) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(singleChatRequest.getJwtString().substring(7));

        var chat= chatService.createChat(currentUserId, singleChatRequest.getUserId());

        for(var c: chat.getUsers()) {
            simpMessagingTemplate.convertAndSendToUser(c.getId().toString(), "/chat/chat-create-response", chat);
        }
        return chat;
    }

    @Transactional
    @MessageMapping("/group-create")
    //@SendTo("/group/group-create-response")
    public ChatDto createGroupHandle(GroupChatRequest req) throws UserException {
        User reqUser = userService.findUserProfile(req.getJwt());

        var group = chatService.createGroup(req, reqUser);

        for (var g : group.getUsers()) {
            simpMessagingTemplate.convertAndSendToUser(g.getId().toString(), "/group/group-create-response", group);
        }
        return group;
    }


    @GetMapping("/{chatId}")
    public ResponseEntity<Chat> findChatByIdHandle(@PathVariable Long chatId) throws ChatException {
        Chat chat = chatService.findChatById(chatId);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @Transactional
    @MessageMapping("/chats")
    //@SendTo("/chat/chats-response")
    public List<ChatDto> findAllChatByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        var chats = chatService.findAllChatByUserId(currentUserId);

        simpMessagingTemplate.convertAndSendToUser(currentUserId.toString(), "/chat/chats-response", chats);

        return chats;
    }

    @Transactional
    @MessageMapping("/groups")
    //@SendTo("/group/groups-response")
    public List<ChatDto> findAllGroupChatsByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        var groups = chatService.findAllGroupChats(currentUserId);
        simpMessagingTemplate.convertAndSendToUser(currentUserId.toString(), "/group/groups-response", groups);

        return groups;
    }

    @GetMapping("/groups/search")
    public List<ChatDto> searchGroupsByName(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("name") String groupName) throws UserException {
        System.out.println("Searching for group: " + groupName);
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        return chatService.searchGroupByName(groupName, currentUserId);
    }

    @Transactional
    @MessageMapping("/user-add")
    //@SendTo("/group/user-add-response")
    public ChatDto addUserToGroup(AddUserInGroupRequest request) throws UserException, ChatException {
        User reqUser = userService.findUserProfile(request.getJwt());
        var group = chatService.addUserToGroup(request.getUserId(), request.getGroupId(), reqUser);
        for (var g : group.getUsers()) {
            simpMessagingTemplate.convertAndSendToUser(g.getId().toString(), "/group/user-add-response", group);
        }
        return group;
    }


    @PutMapping("/{chatId}/remove/{userId}")
    public ResponseEntity<Chat> removeUserFromGroupHandle(@PathVariable Long chatId, @PathVariable Long userId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User reqUser = userService.findUserProfile(jwt);

        Chat chat = chatService.removeFromGroup(chatId, userId, reqUser);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<ApiResponse> deleteChatForUser(
            @PathVariable Long chatId,
            @RequestHeader("Authorization") String jwt
    ) throws UserException, ChatException {
        Long userId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        chatService.deleteChatForUser(chatId, userId);

        ApiResponse res = new ApiResponse("Chat deleted successfully for your view", true);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("/common-groups/{userId}")
    public ResponseEntity<List<ChatDto>> getCommonGroups(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long userId) throws UserException {

        Long currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        List<ChatDto> commonGroups = chatService.findCommonGroups(currentUserId, userId);

        return new ResponseEntity<>(commonGroups, HttpStatus.OK);
    }


    @GetMapping("/{chatId}/users")
    public ResponseEntity<Set<UserDto>> getUsersInGroup(@PathVariable Long chatId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        Long currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        Chat chat = chatService.findChatById(chatId);
        if (chat == null || chat.getUsers().stream().noneMatch(user -> user.getId().equals(currentUserId))) {
            throw new ChatException("You are not part of this group");
        }
        Set<User> users = chatService.getUsersInGroup(chatId);
        Set<UserDto> userDTOs = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toSet());

        return new ResponseEntity<>(userDTOs, HttpStatus.OK);
    }
    @PatchMapping("/{chatId}/pin")
    public ResponseEntity<ApiResponse> pinChat(
            @PathVariable Long chatId,
            @RequestHeader("Authorization") String jwt) throws UserException, ChatException {

        Long userId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        chatService.pinChat(chatId, userId);

        ApiResponse response = new ApiResponse("Chat pinned successfully", true);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
