package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {

    private String accessToken;

    private String tokenType = "Bearer";

    public AuthResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}
