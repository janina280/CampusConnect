package chat.campusconnectserver.controllers;

import chat.campusconnectserver.dtos.Greeting;
import chat.campusconnectserver.services.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @Autowired
    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate, MessageService messageService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
    }

    //todo: for testing
    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(String name) {
        return new Greeting("Hello, " + name + "!");
    }

}
