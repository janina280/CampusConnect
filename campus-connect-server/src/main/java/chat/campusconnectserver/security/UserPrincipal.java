package chat.campusconnectserver.security;

import chat.campusconnectserver.models.Role;
import chat.campusconnectserver.models.User;
import chat.campusconnectserver.services.RoleService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class UserPrincipal implements OAuth2User, UserDetails {
    @Getter
    private final Long id;
    @Getter
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    @Setter
    private Map<String, Object> attributes;
    private final RoleService roleService;

    public UserPrincipal(Long id, String email, String password, Collection<? extends GrantedAuthority> authorities, RoleService roleService) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.roleService = roleService;
    }

    public static UserPrincipal create(User user, RoleService roleService) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        return new UserPrincipal(user.getId(), user.getEmail(), user.getPassword(), authorities, roleService);
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes, RoleService roleService) {
        UserPrincipal userPrincipal = UserPrincipal.create(user, roleService);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(id);
    }

    public User getUser() {
        User user = new User();
        user.setId(this.id);
        user.setEmail(this.email);
        user.setPassword(this.password);

        Set<Role> roles = this.authorities.stream()
                .map(auth -> {
                    String roleName = auth.getAuthority();
                    Role.RoleName roleEnum = switch (roleName) {
                        case "ROLE_USER" -> Role.RoleName.ROLE_USER;
                        case "ROLE_TUTOR" -> Role.RoleName.ROLE_TUTOR;
                        case "ROLE_ADMIN" -> Role.RoleName.ROLE_ADMIN;
                        default -> null;
                    };
                    return roleEnum == null ? null : roleService.findRoleByName(roleEnum);
                })
                .filter(role -> role != null)
                .collect(Collectors.toSet());

        user.setRoles(roles);
        return user;
    }

}
