package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.Chat;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.payload.ApiResponse;
import chat.campusconnectserver.payload.GroupChatRequest;
import chat.campusconnectserver.payload.SingleChatRequest;
import chat.campusconnectserver.security.TokenProvider;
import chat.campusconnectserver.services.ChatService;
import chat.campusconnectserver.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
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

    @PostMapping()
    public ResponseEntity<Chat> createChatHandle(@RequestBody SingleChatRequest singleChatRequest, @RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        Chat chat = chatService.createChat(currentUserId, singleChatRequest.getUserId());

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @PostMapping("/group")
    public ResponseEntity<Chat> createGroupHandle(@RequestBody GroupChatRequest req, @RequestHeader("Authorization") String jwt) throws UserException {
        User reqUser = userService.findUserProfile(jwt);

        Chat chat = chatService.createGroup(req, reqUser);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<Chat> findChatByIdHandle(@PathVariable Long chatId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        Chat chat = chatService.findChatById(chatId);

        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Chat>> findAllChatByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        List<Chat> chats = chatService.findAllChatByUserId(currentUserId);

        return new ResponseEntity<>(chats, HttpStatus.OK);
    }

    @GetMapping("/groups")
    public ResponseEntity<List<Chat>> findAllGroupChatsByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        List<Chat> groupChats = chatService.findAllGroupChats(currentUserId);

        return new ResponseEntity<>(groupChats, HttpStatus.OK);
    }

    @GetMapping("/groups/search")
    public ResponseEntity<List<Chat>> searchGroupsByName(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("name") String groupName) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        List<Chat> groups = chatService.searchGroupByName(groupName, currentUserId);

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
    public ResponseEntity<ApiResponse> deleteChatHandle(@PathVariable Long chatId, @PathVariable Long userId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User reqUser = userService.findUserProfile(jwt);

        chatService.deleteChat(chatId, reqUser.getId());

        ApiResponse res = new ApiResponse("Chat is deleted successfully", true);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}
