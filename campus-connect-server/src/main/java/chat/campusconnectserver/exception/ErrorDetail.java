package chat.campusconnectserver.exception;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ErrorDetail {
    private String error;
    private String message;
    private LocalDateTime timeStamp;

    public ErrorDetail() {
    }

    public ErrorDetail(String error, String message, LocalDateTime timeStamp) {
        this.error = error;
        this.message = message;
        this.timeStamp = timeStamp;
    }

}
