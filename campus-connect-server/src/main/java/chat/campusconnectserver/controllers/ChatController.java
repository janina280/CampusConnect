package chat.campusconnectserver.controllers;

import chat.campusconnectserver.dtos.ChatDto;
import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.Chat;
import chat.campusconnectserver.modal.User;
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
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class ChatController {
    private final ChatService chatService;
    private final UserService userService;

    private final TokenProvider tokenProvider;

    @Autowired
    public ChatController(ChatService chatService, UserService userService, TokenProvider tokenProvider) {
        this.chatService = chatService;
        this.userService = userService;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    @MessageMapping("/chat-create")
    @SendTo("/chat/chat-create-response")
    public ChatDto createChatHandle(@RequestBody SingleChatRequest singleChatRequest, @RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        return chatService.createChat(currentUserId, singleChatRequest.getUserId());
    }

    @Transactional
    @MessageMapping("/group-create")
    @SendTo("/group/group-create-response")
    public ChatDto createGroupHandle(GroupChatRequest req) throws UserException {
        User reqUser = userService.findUserProfile(req.getJwt());

        return chatService.createGroup(req, reqUser);
    }


    @GetMapping("/{chatId}")
    public ResponseEntity<Chat> findChatByIdHandle(@PathVariable Long chatId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        Chat chat = chatService.findChatById(chatId);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @Transactional
    @MessageMapping("/chats")
    @SendTo("/chat/chats-response")
    public List<ChatDto> findAllChatByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        return chatService.findAllChatByUserId(currentUserId);
    }

    @Transactional
    @MessageMapping("/groups")
    @SendTo("/group/groups-response")
    public List<ChatDto> findAllGroupChatsByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        return chatService.findAllGroupChats(currentUserId);
    }

    @GetMapping("/groups/search")
    public ResponseEntity<List<ChatDto>> searchGroupsByName(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("name") String groupName) throws UserException {
        System.out.println("Searching for group: " + groupName);
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        List<ChatDto> groups = chatService.searchGroupByName(groupName, currentUserId);

        return new ResponseEntity<>(groups, HttpStatus.OK);
    }

    @PutMapping("/{chatId}/add/{userId}")
    public ResponseEntity<Chat> addUserToGroupHandle(@PathVariable Long chatId, @PathVariable Long userId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User reqUser = userService.findUserProfile(jwt);

        Chat chat = chatService.addUserToGroup(userId, chatId, reqUser);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @PutMapping("/{chatId}/remove/{userId}")
    public ResponseEntity<Chat> removeUserFromGroupHandle(@PathVariable Long chatId, @PathVariable Long userId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User reqUser = userService.findUserProfile(jwt);

        Chat chat = chatService.removeFromGroup(chatId, userId, reqUser);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<ApiResponse> deleteChatHandle(
            @PathVariable Long chatId,
            @RequestHeader("Authorization") String jwt
    ) throws UserException {
        User reqUser = userService.findUserProfile(jwt);

        chatService.deleteChat(chatId, reqUser.getId());

        ApiResponse res = new ApiResponse("Chat is deleted successfully", true);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

}
