package chat.campusconnectserver.services;

import chat.campusconnectserver.models.AuthenticationCallbackRequest;
import chat.campusconnectserver.models.AuthenticationRequest;
import chat.campusconnectserver.models.AuthenticationResponse;
import chat.campusconnectserver.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;

    /*public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        var savedUser = userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(savedUser, jwtToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }*/

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }

    public AuthenticationResponse authenticateWithExternalTenant(AuthenticationCallbackRequest externalToken) {
        //todo: extract claims from externalToken
        var username = "";


        var user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            //todo: save user to database with no password
        }
        var jwtToken = jwtService.generateToken(user.get());
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .build();
    }
}
