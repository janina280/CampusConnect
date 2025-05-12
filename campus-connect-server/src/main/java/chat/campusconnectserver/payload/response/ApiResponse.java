package chat.campusconnectserver.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponse {
    private String message;
    private boolean success;

    public ApiResponse(String message,boolean success) {
       super();
        this.message = message;
        this.success = success;
    }

}
