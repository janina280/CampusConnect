package chat.campusconnectserver.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpRequest {
    private String name;

    private String email;

    private String password;
}
