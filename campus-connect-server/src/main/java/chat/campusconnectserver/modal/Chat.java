package chat.campusconnectserver.modal;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String img;
    private String time;
    private int unread;
    private boolean pinned;
    private boolean online;

    @Column(name = "is_group")
    private boolean isGroup;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToMany
    private Set<User> admins = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "chat_users",
            joinColumns = @JoinColumn(name = "chat_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonManagedReference
    private Set<User> users = new HashSet<>();
    ;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    @OrderBy("createdDate DESC")
    private List<Message> messages = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;
    @ManyToOne
   @JoinColumn(name = "receiver_id")
    private User receiver;


  //  @Transient
   // public String getTargetChatName(String senderId) {
      // if (sender.getId().equals(senderId)) {
           // return sender.getName();
      //  }
       // return receiver.getName();
  // }

    @Transient
    public long getUnreadMessages(String senderId) {
        return this.messages
                .stream()
                //.filter(m -> m.getReceiverId().equals(senderId))
                .filter(m -> MessageState.sent == m.getState())
                .count();
    }

    @Transient
    public String getLastMessage() {
        if (messages != null && !messages.isEmpty()) {
            if (messages.get(0).getType() != MessageType.text) {
                return "Attachment";
            }
            return messages.get(0).getContent();
        }
        return null; // No messages available
    }
    @Transient
    public LocalDateTime getLastMessageTime() {
        if (messages != null && !messages.isEmpty()) {
            return messages.get(0).getCreatedDate();
        }
        return null;
    }

public Chat(){

}
    public Chat(Long id, String name, String img, String time, int unread, boolean pinned, boolean online, boolean isGroup, User createdBy, Set<User> admins, Set<User> users, List<Message> messages) {
        this.id = id;
        this.name = name;
        this.img = img;
        this.time = time;
        this.unread = unread;
        this.pinned = pinned;
        this.online = online;
        this.isGroup = isGroup;
        this.createdBy = createdBy;
        this.admins = admins;
        this.users = users;
        this.messages = messages;
    }
}
