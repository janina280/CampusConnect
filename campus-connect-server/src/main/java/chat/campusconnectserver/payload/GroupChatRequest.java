package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class GroupChatRequest {
    private List<Long>userIds;
    private String chat_name;
    private String chat_image;
    public GroupChatRequest(List<Long> userIds, String chat_name, String chat_image) {
        this.userIds = userIds;
        this.chat_name = chat_name;
        this.chat_image = chat_image;
    }
public GroupChatRequest(){}


}
