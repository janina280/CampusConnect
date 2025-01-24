package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ResourceNotFoundException;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.CurrentUser;
import chat.campusconnectserver.security.UserPrincipal;
import chat.campusconnectserver.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    @Autowired
    public UserController( UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService=userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/{query}")
    public ResponseEntity<List<User>> searchUserHandler(@PathVariable("query") String q) {
        List<User> users = userService.searchUser(q);
        return new ResponseEntity<List<User>>(users, HttpStatus.OK);
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody User updatedUser,
            @CurrentUser UserPrincipal currentUser) {

        if (!currentUser.getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        User existingUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        existingUser.setNickname(updatedUser.getNickname());
        existingUser.setAbout(updatedUser.getAbout());

        userRepository.save(existingUser);

        return ResponseEntity.ok(existingUser);
    }
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

}
