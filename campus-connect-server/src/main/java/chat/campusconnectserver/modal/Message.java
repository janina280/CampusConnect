package chat.campusconnectserver.modal;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;
    private LocalDateTime timestamp;

    @ManyToOne
    private  User user ;
    @ManyToOne
    @JsonBackReference
    private Chat chat;

    private String formattedTime;

    public Message(Long id, String content,String formattedTime, LocalDateTime timestamp, User user, Chat chat) {
        this.id = id;
        this.content = content;
        this.timestamp = timestamp;
        this.user = user;
        this.chat = chat;
        this.formattedTime=formattedTime;
    }

    public Message() {

    }

}
