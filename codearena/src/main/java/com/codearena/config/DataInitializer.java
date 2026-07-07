package com.codearena.config;

import com.codearena.entity.User;
import com.codearena.enums.Role;
import com.codearena.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Initializes seed data on application startup.
 * Creates the default admin account if it does not already exist,
 * and ensures the password hash is always up-to-date.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_EMAIL    = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        Optional<User> existing = userRepository.findByUsername(ADMIN_USERNAME);

        if (existing.isEmpty()) {
            User admin = User.builder()
                    .username(ADMIN_USERNAME)
                    .email(ADMIN_EMAIL)
                    .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                    .role(Role.ADMIN)
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(admin);
            log.info("✅ Admin account created successfully (username: {}, email: {})",
                    ADMIN_USERNAME, ADMIN_EMAIL);
        } else {
            // Always sync the password hash so login works even if migration had a bad hash
            User admin = existing.get();
            if (!passwordEncoder.matches(ADMIN_PASSWORD, admin.getPasswordHash())) {
                admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
                admin.setRole(Role.ADMIN);
                admin.setEmail(ADMIN_EMAIL);
                userRepository.save(admin);
                log.info("✅ Admin account password hash corrected (username: {})", ADMIN_USERNAME);
            } else {
                log.info("✅ Admin account already exists and is healthy (username: {})", ADMIN_USERNAME);
            }
        }
    }
}
