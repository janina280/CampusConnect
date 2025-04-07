package chat.campusconnectserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CampusConnectServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusConnectServerApplication.class, args);
    }

}
