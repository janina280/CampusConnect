package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.MessageException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.MessageMapper;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.payload.ApiResponse;
import chat.campusconnectserver.payload.MessageRequest;
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

import java.util.List;

@RestController
@RequestMapping("/api/message")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    private final MessageMapper messageMapper;

    private final SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    public MessageController(MessageService messageService, UserService userService, MessageMapper messageMapper, SimpMessagingTemplate simpMessagingTemplate) {
        this.messageService = messageService;
        this.userService = userService;
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

        if(messages.isEmpty()) {
            simpMessagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    "/message/chat",
                    messageMapper.toMessagesResponse(messages)
            );
            return;
        }

        for (var chatUser : messages.get(0).getChat().getUsers()) {
            var messageResponse = messageMapper.toMessagesResponse(messages);
            simpMessagingTemplate.convertAndSendToUser(
                    chatUser.getId().toString(),
                    "/message/chat",
                    messageResponse
            );
        }
    }



    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse> deleteMessagesHandler(@PathVariable Long messageId, @RequestHeader("Authorization") String jwt) throws UserException, MessageException {
        User user = userService.findUserProfile(jwt);

        messageService.deleteMessage(messageId, user);
        ApiResponse res = new ApiResponse("Message deleted succesfully", false);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}
