package chat.campusconnectserver.controllers;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.function.EntityResponse;

@Controller
@Data
@RequestMapping(value = "api/user")
public class UserController {

    @GetMapping("/test")
    public ResponseEntity<String> Test() {
        return ResponseEntity.status(HttpStatus.OK).body("wqorks!");
    }
}
