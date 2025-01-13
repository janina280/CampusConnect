package chat.campusconnectserver.controllers;

import chat.campusconnectserver.exception.ResourceNotFoundException;
import chat.campusconnectserver.model.User;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.CurrentUser;
import chat.campusconnectserver.security.UserPrincipal;
import chat.campusconnectserver.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
public class UserController {
@Autowired
    private final UserRepository userRepository;
private UserService userService;

public UserController(UserService userService, UserRepository userRepository){
    this.userService=userService;
    this.userRepository=userRepository;
}
    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/{query}")
    public ResponseEntity<List<User>> searchUserHandler(@PathVariable("query")String q){
        List<User> users=userService.searchUser(q);
        return new ResponseEntity<List<User>>(users, HttpStatus.OK);
    }

    @PutMapping("/updateProfile")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser, @RequestHeader("Authorization") String token) {
        try {
            String authToken = token.replace("Bearer ", "");


            User existingUser = userRepository.findById(updatedUser.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            existingUser.setNickname(updatedUser.getNickname());
            existingUser.setAbout(updatedUser.getAbout());

            userRepository.save(existingUser);

            return ResponseEntity.ok(existingUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

}
