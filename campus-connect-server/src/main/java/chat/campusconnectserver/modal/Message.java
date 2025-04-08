package chat.campusconnectserver.modal;

import chat.campusconnectserver.common.BaseAuditingEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Message extends BaseAuditingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String content;

    @Enumerated(EnumType.STRING)
    private MessageState state;
    @Enumerated(EnumType.STRING)
    private MessageType type;

    @ManyToOne
    private  User user ;
    @ManyToOne
    @JsonBackReference
    private Chat chat;

    private String formattedTime;
    @Column(name = "sender_id", nullable = false)
    private String senderId;
    //@Column(name = "receiver_id", nullable = false)
   // private Long receiverId;
    private String mediaFilePath;

}
