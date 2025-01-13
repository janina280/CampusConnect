package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.User;
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
        String email = String.valueOf(tokenProvider.getUserIdFromToken(jwt));
        if (email == null) {
            throw new BadCredentialsException("Invalid token: unable to extract user email");
        }
        User user = userRepository.findByEmail(email);
        if (user==null) {
            throw new UserException("User not found with email: " + email);
        }
        return user;
    }

    public User updateProfile(User user) {
        return userRepository.save(user);
    }

    public List<User> searchUser(String query) {
        List<User> users = userRepository.searchUser(query);
        return users;
    }

}
