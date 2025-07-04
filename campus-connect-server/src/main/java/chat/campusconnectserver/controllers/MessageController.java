package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.models.Chat;
import chat.campusconnectserver.models.Message;
import chat.campusconnectserver.models.MessageMapper;
import chat.campusconnectserver.models.User;
import chat.campusconnectserver.payloads.request.MessageRequest;
import chat.campusconnectserver.payloads.response.ApiResponse;
import chat.campusconnectserver.services.ChatService;
import chat.campusconnectserver.services.MessageService;
import chat.campusconnectserver.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final ChatService chatService;
    private final MessageMapper messageMapper;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public MessageController(MessageService messageService, UserService userService, ChatService chatService, MessageMapper messageMapper, SimpMessagingTemplate simpMessagingTemplate) {
        this.messageService = messageService;
        this.userService = userService;
        this.chatService = chatService;
        this.messageMapper = messageMapper;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Transactional
    @MessageMapping("/send-message")
    public void sendMessageHandler(@RequestBody MessageRequest req) throws UserException, ChatException {
        User user = userService.findUserProfile(req.getJwtString());

        var message = messageService.sendMessage(req, user);
        var response = messageMapper.toMessageResponse(message);

        for (var m : message.getChat().getUsers()) {
            simpMessagingTemplate.convertAndSendToUser(
                    m.getId().toString(),
                    "/message/message-send-response",
                    response
            );
        }
    }

    @MessageMapping("/get-messages/{chatId}")
    public void getMessagesHandler(@DestinationVariable Long chatId, String jwt) throws UserException, ChatException {
        User user = userService.findUserProfile(jwt);

        List<Message> messages = messageService.getChatsMessages(chatId, user);

        if (!messages.isEmpty()) {
            Chat chat = chatService.findChatById(chatId);

            String destination = chat.isGroup()
                    ? "/message/group"
                    : "/message/chat";

            simpMessagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    destination,
                    messageMapper.toMessagesResponse(messages)
            );
        }
    }

    @GetMapping("/media")
    public ResponseEntity<byte[]> getMedia(
            @RequestParam("mediaId") String mediaId,
            @RequestHeader("Authorization") String jwt
    ) {
        User user = userService.findUserProfile(jwt);

        byte[] mediaContent = messageService.getMediaMessage(mediaId, user);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + mediaId)
                .body(mediaContent);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadMedia(
            @RequestParam("media") MultipartFile file,
            @RequestHeader("Authorization") String jwt
    ) {
        User user = userService.findUserProfile(jwt);
        var filePath = messageService.uploadMediaMessage(file, user);
        return new ResponseEntity<>(filePath, HttpStatus.OK);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse> deleteMessagesHandler(@PathVariable Long messageId,
                                                             @RequestHeader("Authorization") String jwt) throws UserException, MessageException {
        User user = userService.findUserProfile(jwt);

        messageService.deleteMessage(messageId, user);
        ApiResponse res = new ApiResponse("Message deleted succesfully", false);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PutMapping("/{messageId}/starred")
    public Message markMessageAsStarred(@PathVariable Long messageId) {
        return messageService.markMessageAsStarred(messageId);
    }

    @GetMapping("/{chatId}/shared")
    public ResponseEntity<List<Message>> getSharedMessagesForChat(@PathVariable Long chatId, @RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfile(jwt);
        List<Message> messages = messageService.getSharedMessagesForChat(chatId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/count-media/{chatId}")
    public ResponseEntity<Long> countSharedMedia(@PathVariable Long chatId) {
        long count = messageService.countSharedMedia(chatId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/last-3-images/{chatId}")
    public ResponseEntity<List<Map<String, Object>>> getLast3ImagesByChatId(@PathVariable Long chatId) {
        List<Message> messages = messageService.getLast3ImagesByChatId(chatId);

        List<Map<String, Object>> response = messages.stream().map(msg -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", msg.getId());
            map.put("mediaFilePath", msg.getMediaFilePath());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }


}
