package chat.campusconnectserver.chat;

import chat.campusconnectserver.chatroom.ChatRoomRepository;
import chat.campusconnectserver.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomService chatRoomService;

    public ChatMessage save(ChatMessage chatMessage) {
        var childId = chatRoomService.getChatRoomId(chatMessage.getSenderId(), chatMessage.getRecipientId(), true
                )
                .orElseThrow();
        chatMessage.setChatId(childId);
        chatMessageRepository.save(chatMessage);
        return chatMessage;
    }

    public List<ChatMessage> findChatMessages(String senderId,String recipientId){
        var chatId=chatRoomService.getChatRoomId(senderId, recipientId, false);
return  chatId.map(chatMessageRepository::findByChatId).orElse(new ArrayList<>());
    }
}
