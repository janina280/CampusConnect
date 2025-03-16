package chat.campusconnectserver.dtos;


import chat.campusconnectserver.modal.Chat;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatDto {
    private Long id;

    private String name;
    private String img;
    private String time;
    private int unread;
    private boolean pinned;
    private boolean online;
    private boolean isGroup;
    private UserDto createdBy;
    private List<UserDto> admins = new ArrayList<>();
    private List<UserDto> users = new ArrayList<>();
    private List<MessageDto> messages = new ArrayList<>();

    public ChatDto(Chat chat) {
        this.id = chat.getId();
        this.name = chat.getName();
        this.img = chat.getImg();
        this.time = chat.getTime();
        this.unread = chat.getUnread();
        this.pinned = chat.isPinned();
        this.online = chat.isOnline();
        this.isGroup = chat.isGroup();
        this.createdBy = new UserDto(chat.getCreatedBy());
        this.admins = chat.getAdmins().stream().map(UserDto::new).toList();
        this.users = chat.getUsers().stream().map(UserDto::new).toList();
        this.messages = chat.getMessages().stream().map(MessageDto::new).toList();
    }
}
