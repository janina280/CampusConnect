package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginRequest {

    private String email;


    private String password;

}
