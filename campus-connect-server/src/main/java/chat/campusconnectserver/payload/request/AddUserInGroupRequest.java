package chat.campusconnectserver.payload.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AddUserInGroupRequest {
    private Long groupId;
    private Long userId;
    private String jwt;
}
