package chat.campusconnectserver.controllers;

import chat.campusconnectserver.models.AuthenticationCallbackRequest;
import chat.campusconnectserver.models.AuthenticationRequest;
import chat.campusconnectserver.models.AuthenticationResponse;
import chat.campusconnectserver.services.AuthenticationService;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Data
@RequestMapping(value = "api/auth")
public class AuthController {
    private AuthenticationService authenticationService;

   /* @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.register(request));
    }*/

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/authenticate-callback")
    public ResponseEntity<AuthenticationResponse> authenticateCallback(
            @RequestBody AuthenticationCallbackRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticateWithExternalTenant(request));
    }
}
