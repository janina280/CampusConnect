package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AddUserInGroupRequest {
    private Long groupId;
    private Long userId;
    private String jwt;
}
