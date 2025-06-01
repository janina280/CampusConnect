package chat.campusconnectserver.services;

import chat.campusconnectserver.dtos.UserDto;
import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.TokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;

    @Autowired
    public UserService(UserRepository userRepository, TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Transactional
    public User findUserById(Long id) throws UserException {
        Optional<User> optional = userRepository.findById(id);
        if (optional.isPresent()) {
            return optional.get();
        }
        throw new UserException("User not found with id" + id);
    }

    @Transactional(readOnly = true)
    public UserDto getUserDtoById(Long id) throws UserException {
        User user = userRepository.findByIdWithRoles(id)
                .orElseThrow(() -> new UserException("User not found with id " + id));
        return new UserDto(user);
    }


    public User findUserProfile(String jwt) {
        Long userId = tokenProvider.getUserIdFromToken(jwt.substring(7));
        if (userId == null) {
            throw new BadCredentialsException("Invalid token: unable to extract user email");
        }
        var user = userRepository.findById(userId);
        return user.get();
    }

    public List<UserDto> searchUser(String query) {
        List<User> users = userRepository.searchUser(query);
        return users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public List<UserDto> findAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserDto::new).collect(Collectors.toList());
    }

}
