package chat.campusconnectserver.controllers;

import chat.campusconnectserver.dtos.UserDto;
import chat.campusconnectserver.dtos.UserMessageCountDto;
import chat.campusconnectserver.exception.ResourceNotFoundException;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.repositories.MessageRepository;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.CurrentUser;
import chat.campusconnectserver.security.UserPrincipal;
import chat.campusconnectserver.services.UserService;
import chat.campusconnectserver.util.FileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final FileService fileService;
    private final UserService userService;
    @Autowired
    public UserController(UserRepository userRepository, MessageRepository messageRepository, FileService fileService, UserService userService) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.fileService = fileService;
        this.userService=userService;
    }

    @GetMapping
   // @PreAuthorize("hasRole('USER')")
    public User getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));
    }

    @GetMapping("/search")
    public List<UserDto> searchUsers(@RequestParam String query) {
        return userService.searchUser(query);
    }


    @PutMapping("/update")
    public ResponseEntity<UserDto> updateProfile(
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart("updatedUserDto") @Valid UserDto updatedUserDto,
            @CurrentUser UserPrincipal currentUser) {
        if (!currentUser.getId().equals(updatedUserDto.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        User existingUser = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        existingUser.setNickname(updatedUserDto.getNickname());
        existingUser.setAbout(updatedUserDto.getAbout());

        if (image != null && !image.isEmpty()) {
            String imagePath = fileService.saveFile(image, Long.valueOf(currentUser.getId().toString()));
            existingUser.setImageUrl(imagePath);
        }

        userRepository.save(existingUser);

        UserDto updatedUserResponse = new UserDto(existingUser);
        return ResponseEntity.ok(updatedUserResponse);
    }


    @GetMapping("/all")
    public List<UserDto> getAllUsers() {
        return userService.findAllUsers();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<List<UserDto>> getAllUsersForAdmin() {
        List<UserDto> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/messages")
    public ResponseEntity<List<UserMessageCountDto>> getTopUsersByMessages() {
        List<UserMessageCountDto> topUsers = messageRepository.findTopUsersByMessageCount(PageRequest.of(0, 5));
        return ResponseEntity.ok(topUsers);
    }

}
