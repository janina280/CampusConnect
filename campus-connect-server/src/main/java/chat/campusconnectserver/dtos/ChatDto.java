package chat.campusconnectserver.dtos;

import chat.campusconnectserver.modal.Chat;
import chat.campusconnectserver.modal.Message;
import chat.campusconnectserver.modal.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

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
        this.time = chat.getMessages() != null && !chat.getMessages().isEmpty() ?
                chat.getMessages().get(0).getFormattedTime() : null;
        this.unread = chat.getUnread();
        this.pinned = chat.isPinned();
        this.online = chat.isOnline();
        this.isGroup = chat.isGroup();
        this.createdBy = new UserDto(chat.getCreatedBy());
        this.admins = chat.getAdmins().stream().map(UserDto::new).toList();
        this.users = chat.getUsers().stream().map(UserDto::new).toList();
        this.messages = chat.getMessages().stream().map(MessageDto::new).toList();
    }

    public ChatDto(Long id, String name, Set<User> users, List<Message> messages) {
        this.id = id;
        this.name = name;
        this.users = users.stream().map(UserDto::new).collect(Collectors.toList());
        this.messages = messages.stream().map(MessageDto::new).collect(Collectors.toList());
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        ChatDto chatDto = (ChatDto) obj;
        return Objects.equals(id, chatDto.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}
