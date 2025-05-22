package chat.campusconnectserver.controllers;

import chat.campusconnectserver.dtos.UserDto;
import chat.campusconnectserver.dtos.UserMessageCountDto;
import chat.campusconnectserver.exception.ResourceNotFoundException;
import chat.campusconnectserver.modal.Role;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.repositories.MessageRepository;
import chat.campusconnectserver.repositories.RoleRepository;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final FileService fileService;
    private final UserService userService;
    private final RoleRepository roleRepository;
    @Autowired
    public UserController(UserRepository userRepository, MessageRepository messageRepository, FileService fileService, UserService userService, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.fileService = fileService;
        this.userService=userService;
        this.roleRepository = roleRepository;
    }

    @GetMapping
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
    @Transactional
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/{id}/role")
    @Transactional
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String newRoleName = request.get("role");

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Role.RoleName roleEnum = Role.RoleName.valueOf(newRoleName);
            Role role = roleRepository.findByName(roleEnum)
                    .orElseThrow(() -> new RuntimeException("Role not found"));

            user.setRoles(new HashSet<>(List.of(role)));

            userRepository.save(user);

            return ResponseEntity.ok("Role updated successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats/messages")
    public ResponseEntity<List<UserMessageCountDto>> getTopUsersByMessages() {
        List<UserMessageCountDto> topUsers = messageRepository.findTopUsersByMessageCount(PageRequest.of(0, 5));
        return ResponseEntity.ok(topUsers);
    }

}
