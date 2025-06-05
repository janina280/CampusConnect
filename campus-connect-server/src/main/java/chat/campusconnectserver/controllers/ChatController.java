package chat.campusconnectserver.controllers;

import chat.campusconnectserver.dtos.ChatDto;
import chat.campusconnectserver.dtos.UserDto;
import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.models.Chat;
import chat.campusconnectserver.models.User;
import chat.campusconnectserver.payloads.request.AddUserInGroupRequest;
import chat.campusconnectserver.payloads.request.GroupChatRequest;
import chat.campusconnectserver.payloads.request.SingleChatRequest;
import chat.campusconnectserver.payloads.response.ApiResponse;
import chat.campusconnectserver.security.TokenProvider;
import chat.campusconnectserver.services.ChatService;
import chat.campusconnectserver.services.UserService;
import chat.campusconnectserver.utils.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class ChatController {
    private final ChatService chatService;
    private final UserService userService;
    private final TokenProvider tokenProvider;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final FileService fileService;

    @Autowired
    public ChatController(ChatService chatService, UserService userService, TokenProvider tokenProvider, SimpMessagingTemplate simpMessagingTemplate, FileService fileService) {
        this.chatService = chatService;
        this.userService = userService;
        this.tokenProvider = tokenProvider;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.fileService = fileService;
    }

    @Transactional
    @MessageMapping("/chat-create")
    public ChatDto createChatHandle(@RequestBody SingleChatRequest singleChatRequest) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(singleChatRequest.getJwtString().substring(7));

        var chat = chatService.createChat(currentUserId, singleChatRequest.getUserId());

        for (var c : chat.getUsers()) {
            simpMessagingTemplate.convertAndSendToUser(c.getId().toString(), "/chat/chat-create-response", chat);
        }
        return chat;
    }

    @Transactional
    @MessageMapping("/group-create")
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
    public List<ChatDto> findAllChatByUserHandle(@RequestHeader("Authorization") String jwt) throws UserException {
        var currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        var chats = chatService.findAllChatByUserId(currentUserId);

        simpMessagingTemplate.convertAndSendToUser(currentUserId.toString(), "/chat/chats-response", chats);

        return chats;
    }

    @Transactional
    @MessageMapping("/groups")
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

    @PatchMapping("/{chatId}/unpin")
    public ResponseEntity<ApiResponse> unpinChat(
            @PathVariable Long chatId,
            @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        Long userId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        chatService.unpinChat(chatId, userId);

        ApiResponse response = new ApiResponse("Chat unpinned successfully", true);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/groups")
    public ResponseEntity<List<ChatDto>> getAllGroupsForAdmin(@RequestHeader("Authorization") String jwt) throws UserException {
        Long currentUserId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        List<ChatDto> groups = chatService.findAllGroupsForAdmin(currentUserId);

        return new ResponseEntity<>(groups, HttpStatus.OK);
    }

    @PutMapping("/{chatId}/image")
    public ResponseEntity<Chat> updateGroupImage(
            @PathVariable Long chatId,
            @RequestPart("image") MultipartFile image,
            @RequestHeader("Authorization") String jwt
    ) throws UserException, ChatException {
        Long userId = tokenProvider.getUserIdFromToken(jwt.substring(7));

        Chat chat = chatService.findChatById(chatId);
        if (!chat.isGroup()) {
            throw new ChatException("Only group chats can have images");
        }

        boolean isAdmin = chat.getAdmins().stream().anyMatch(admin -> admin.getId().equals(userId));
        if (!isAdmin) {
            throw new ChatException("Only admins can update the group image");
        }

        String imagePath = fileService.saveGroupImage(image, chatId);
        if (imagePath == null) {
            throw new ChatException("Failed to save image");
        }

        chat.setImg(imagePath);
        Chat updatedChat = chatService.saveChat(chat);

        return new ResponseEntity<Chat>(updatedChat, HttpStatus.OK);

    }

    @GetMapping("/groups/{groupId}/image/{fileName}")
    public ResponseEntity<byte[]> getGroupImage(
            @PathVariable Long groupId,
            @PathVariable String fileName
    ) {
        byte[] file = fileService.getGroupFile(groupId, fileName);
        if (file == null) return ResponseEntity.notFound().build();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(file, headers, HttpStatus.OK);
    }


}
