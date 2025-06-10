package chat.campusconnectserver.dtos;

import chat.campusconnectserver.models.AuthProvider;
import chat.campusconnectserver.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String imageUrl;
    private Boolean emailVerified = false;
    private String password;
    private AuthProvider provider;
    private String providerId;
    private String nickname;
    private String about;
    private Set<String> roles;

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.imageUrl = user.getImageUrl();
        this.emailVerified = user.getEmailVerified();
        this.password = user.getPassword();
        this.provider = user.getProvider();
        this.providerId = user.getProviderId();
        this.nickname = user.getNickname();
        this.about = user.getAbout();
        this.roles = user.getRoles().stream()
                .map(role -> role.getName().name().replace("ROLE_", "").toLowerCase())
                .collect(Collectors.toSet());

    }
}