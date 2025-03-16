package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.payload.SendMessageRequest;
import chat.campusconnectserver.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @Autowired
    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload SendMessageRequest request) throws IOException, ChatException, UserException {
        Message message = messageService.sendMessage(request);

        // Trimite mesajul DOAR către destinatar
        messagingTemplate.convertAndSendToUser(
                request.getReceiverId().toString(), // ID-ul destinatarului
                "/queue/messages",
                message
        );
    }
}
