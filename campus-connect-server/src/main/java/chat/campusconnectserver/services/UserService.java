package chat.campusconnectserver.services;

import chat.campusconnectserver.exception.UserException;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.TokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private UserRepository userRepository;

    private TokenProvider tokenProvider;

    public UserService(UserRepository userRepository, TokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    public User findUserById(Long id) throws UserException {
        Optional<User> optional = userRepository.findById(id);
        if (optional.isPresent()) {
            return optional.get();
        }
        throw new UserException("User not found with id" + id);
    }

    public Optional<User> findUserProfile(String jwt) throws UserException {
        String email = String.valueOf(tokenProvider.getUserIdFromToken(jwt));
        if (email != null) {
            throw new BadCredentialsException("recieved invalid token--");
        }
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new UserException("user not found with email");
        }
        return user;
    }

    public List<User> searchUser(String query) {
        List<User> users=userRepository.searchUser(query);
    return users;
    }

}
