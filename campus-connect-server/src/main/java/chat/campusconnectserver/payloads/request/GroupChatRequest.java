package chat.campusconnectserver.payloads.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class GroupChatRequest {
    private List<Long> userIds;
    @JsonProperty("name")
    private String chat_name;
    private String chat_image;
    private String jwt;
}