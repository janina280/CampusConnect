package chat.campusconnectserver.seeder;

import chat.campusconnectserver.models.Role;
import chat.campusconnectserver.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class RoleSeeder {

    @Bean
    public CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            Arrays.stream(Role.RoleName.values()).forEach(roleName -> {
                roleRepository.findByName(roleName).orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
            });
        };
    }
}

