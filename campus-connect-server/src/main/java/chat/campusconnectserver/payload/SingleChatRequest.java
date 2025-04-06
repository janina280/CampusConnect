package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SingleChatRequest {
    private Long userId;
    private String jwtString;
}
