package chat.campusconnectserver.payload;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AuthResponse {

    private String accessToken;

    private String tokenType = "Bearer";

    private Long userId;

    public AuthResponse(Long userId, String accessToken) {
        this.userId = userId;
        this.accessToken = accessToken;
    }
}
