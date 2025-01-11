package chat.campusconnectserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CampusConnectServerApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(CampusConnectServerApplication.class);
        app.setAdditionalProfiles("dev");
        app.run(args);
    }

}
