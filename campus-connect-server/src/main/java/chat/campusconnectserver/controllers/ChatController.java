package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ChatException;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.Chat;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.payload.GroupChatRequest;
import chat.campusconnectserver.payload.SingleChatRequest;
import chat.campusconnectserver.services.ChatService;
import chat.campusconnectserver.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/chats")
public class ChatController {
    private ChatService chatService;
    private UserService userService;

    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
        this.userService = userService;
    }

  //  @PostMapping("/single")
    //public ResponseEntity<Chat>createChatHandle(@RequestBody SingleChatRequest singleChatRequest, @RequestHeader("Autorization")String jwt) throws UserException {
    //    Optional<User> reqUser=userService.findUserProfile(jwt);
        //Chat chat=chatService.createChat(reqUser, singleChatRequest.getUserId());

      //  return  new ResponseEntity<Chat>(chat, HttpStatus.OK);
   // }

    //@PostMapping("/group")
   // public ResponseEntity<Chat>createGroupHandle(@RequestBody GroupChatRequest req, @RequestHeader("Autorization")String jwt) throws UserException {
    //    Optional<User> reqUser=userService.findUserProfile(jwt);
      //  Chat chat=chatService.createGroup(req, reqUser);

      //  return  new ResponseEntity<Chat>(chat, HttpStatus.OK);
    //}

    @GetMapping("/{chatId}")
    public ResponseEntity<Chat>findChatByIdHandle(@PathVariable Long chatId, @RequestHeader("Autorization")String jwt) throws UserException, ChatException {
        Chat chat=chatService.findChatById(chatId);
        return  new ResponseEntity<Chat>(chat, HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Chat>>createGroupHandle( @RequestHeader("Autorization")String jwt) throws UserException {
        Optional<User> reqUser=userService.findUserProfile(jwt);
        List<Chat> chats=chatService.findAllChatByUserId(reqUser.get().getId());

        return  new ResponseEntity<List<Chat>>(chats, HttpStatus.OK);
    }

    //@PutMapping("/{chatId}/add/{userId}")
    //public ResponseEntity<List<Chat>>createGroupHandle( @PathVariable Long chatId, @PathVariable Long userId, @RequestHeader("Autorization")String jwt) throws UserException {
      //  Optional<User> reqUser=userService.findUserProfile(jwt);
       // List<Chat> chats=chatService.addUserToGroup(userId, chatId, reqUser);

       // return  new ResponseEntity<List<Chat>>(chats, HttpStatus.OK);
   // }
}
