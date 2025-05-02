package chat.campusconnectserver.dtos;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserMessageCountDto {
    private Long userId;
    private String name;
    private String imageUrl;
    private Long messageCount;

    public UserMessageCountDto(Long userId, String name, String imageUrl, Long messageCount) {
        this.userId = userId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.messageCount = messageCount;
    }

}
