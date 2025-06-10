package chat.campusconnectserver.payloads.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SingleChatRequest {
    private Long userId;
    private String jwtString;
}
