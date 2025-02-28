package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.TokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final TokenProvider tokenProvider;

    @Autowired
    public UserService(UserRepository userRepository, TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    public User findUserById(Long id) throws UserException {
        Optional<User> optional = userRepository.findById(id);
        if (optional.isPresent()) {
            return optional.get();
        }
        throw new UserException("User not found with id" + id);
    }

    public User findUserProfile(String jwt) throws UserException {
        Long userId = tokenProvider.getUserIdFromToken(jwt.substring(7));
        if (userId == null) {
            throw new BadCredentialsException("Invalid token: unable to extract user email");
        }
        var user = userRepository.findById(userId);
        if (user == null) {
            throw new UserException("User not found with id: " + userId);
        }
        return user.get();
    }

    public User updateProfile(User user) {
        return userRepository.save(user);
    }

    public List<User> searchUser(String query) {
        List<User> users = userRepository.searchUser(query);
        return users;
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

}
