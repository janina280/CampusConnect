package chat.campusconnectserver.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Bine ai venit la CampusConnect! Aplicația este activă.";
    }
}
