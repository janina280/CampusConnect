package chat.campusconnectserver.controllers;

import chat.campusconnectserver.modal.AuthProvider;
import chat.campusconnectserver.modal.Role;
import chat.campusconnectserver.modal.User;
import chat.campusconnectserver.payload.response.ApiResponse;
import chat.campusconnectserver.payload.response.AuthResponse;
import chat.campusconnectserver.payload.request.LoginRequest;
import chat.campusconnectserver.payload.request.SignUpRequest;
import chat.campusconnectserver.repositories.RoleRepository;
import chat.campusconnectserver.repositories.UserRepository;
import chat.campusconnectserver.security.TokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Collections;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenProvider tokenProvider;
    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        if (!loginRequest.getEmail().endsWith("@campusconnect.com")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse("The email must be of the type @campusconnect.com.", false));
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.createToken(authentication);

        var user = userRepository.findByEmail(loginRequest.getEmail());
        return ResponseEntity.ok(new AuthResponse(user.getId(), token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody SignUpRequest signUpRequest) {
        if (!signUpRequest.getEmail().endsWith("@campusconnect.com")) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse("The email must be of the type @campusconnect.com.", false));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new ApiResponse("Email address already in use.", false));
        }

        // Creating user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(signUpRequest.getPassword());
        user.setProvider(AuthProvider.local);

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Role roleUser = roleRepository.findByName(Role.RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Role ROLE_USER not found!"));
        user.setRoles(Collections.singleton(roleUser));


        User result = userRepository.save(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/user/me")
                .buildAndExpand(result.getId()).toUri();

        return ResponseEntity.created(location)
                .body(new ApiResponse( "User registered successfully!",true));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new ApiResponse( "User logged out successfully.",true));
    }

}
