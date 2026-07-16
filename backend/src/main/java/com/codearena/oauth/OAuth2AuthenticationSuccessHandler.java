package com.codearena.oauth;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.codearena.entity.User;
import com.codearena.enums.Role;
import com.codearena.repository.UserRepository;
import com.codearena.security.CustomUserDetails;
import com.codearena.security.JwtService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = User.builder()
                            .username(generateUsername(name))
                            .email(email)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .role(Role.USER)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return userRepository.save(newUser);
                });

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String jwt = jwtService.generateToken(userDetails);

        response.sendRedirect(
                "http://localhost:5173/oauth2/success?token=" + jwt);
    }

    private String generateUsername(String name) {

        String username = name
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");

        if (username.isBlank()) {
            username = "user";
        }

        String original = username;
        int count = 1;

        while (userRepository.existsByUsername(username)) {
            username = original + count++;
        }

        return username;
    }
}