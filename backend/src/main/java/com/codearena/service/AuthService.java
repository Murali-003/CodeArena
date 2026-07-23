package com.codearena.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.codearena.dto.auth.LoginRequest;
import com.codearena.dto.auth.LoginResponse;
import com.codearena.dto.auth.RegisterRequest;
import com.codearena.entity.LeaderboardEntry;
import com.codearena.entity.User;
import com.codearena.enums.Role;
import com.codearena.repository.LeaderboardEntryRepository;
import com.codearena.repository.UserRepository;
import com.codearena.security.CustomUserDetails;
import com.codearena.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;   
    private final LeaderboardEntryRepository leaderboardEntryRepository; 

    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        String token = jwtService.generateToken(new CustomUserDetails(user));

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public LoginResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        user = userRepository.save(user);

LeaderboardEntry leaderboardEntry = LeaderboardEntry.builder()
        .user(user)
        .build();

leaderboardEntryRepository.save(leaderboardEntry);

try {
    emailService.sendWelcomeEmail(
            user.getEmail(),
            user.getUsername()
    );
} catch (Exception e) {
    // Log the exception
    System.err.println("Failed to send welcome email: " + e.getMessage());
}

        String token = jwtService.generateToken(new CustomUserDetails(user));

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}