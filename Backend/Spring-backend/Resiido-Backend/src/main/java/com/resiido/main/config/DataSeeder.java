package com.resiido.main.config;

import com.resiido.main.models.User;
import com.resiido.main.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin0 exists
            if (userRepository.findByEmail("exampleresidence1@gmail.com").isEmpty()) {
                User admin0 = new User();
                admin0.setName("admin0");
                admin0.setEmail("exampleresidence1@gmail.com");
                admin0.setPassword(passwordEncoder.encode("exampleadmin0")); // Always hash!
                admin0.setRole("MANAGER");
                admin0.setVerified(true);

                userRepository.save(admin0);
                System.out.println("✅ admin0 created successfully.");
            } else {
                System.out.println("ℹ️ admin0 already exists.");
            }
        };
    }
}