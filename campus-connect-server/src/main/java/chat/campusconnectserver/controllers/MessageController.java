package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.Message;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.payload.ApiResponse;
import chat.campusconnectserver.payload.SendMessageRequest;
import chat.campusconnectserver.services.MessageService;
import chat.campusconnectserver.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    @Autowired
    public MessageController(MessageService messageService, UserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<Message> sendMessageHandler(@RequestBody SendMessageRequest req, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User user = userService.findUserProfile(jwt);

        req.setUserId(user.getId());

        Message message = messageService.sendMessage(req);
        return new ResponseEntity<Message>(message, HttpStatus.OK);
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<Message>> getChatsMessagesHandler(@PathVariable Long chatId, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User user = userService.findUserProfile(jwt);

        List<Message> messages = messageService.getChatsMessages(chatId, user);
        return new ResponseEntity<List<Message>>(messages, HttpStatus.OK);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse> deleteMessagesHandler(@PathVariable Long messageId, @RequestHeader("Authorization") String jwt) throws UserException, MessageException {
        User user = userService.findUserProfile(jwt);

        messageService.deleteMessage(messageId, user);
        ApiResponse res = new ApiResponse("Message deleted succesfully", false);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}
