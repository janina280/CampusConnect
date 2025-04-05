package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.payload.ApiResponse;
import chat.campusconnectserver.payload.MessageRequest;
import chat.campusconnectserver.services.MessageService;
import chat.campusconnectserver.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    @Autowired
    public MessageController(MessageService messageService, UserService userService) {
        this.messageService = messageService;
        this.userService = userService;
    }

    @PostMapping()
    public ResponseEntity<Message> sendMessageHandler(@RequestBody MessageRequest req, @RequestHeader("Authorization") String jwt) throws UserException, ChatException {
        User user = userService.findUserProfile(jwt);

        req.setSenderId(user.getId());

        Message message = messageService.sendMessage(req);
        return new ResponseEntity<Message>(message, HttpStatus.OK);
    }

    @GetMapping("/{chatId}")
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
