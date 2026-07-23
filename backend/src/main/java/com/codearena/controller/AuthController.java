package com.codearena.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codearena.dto.auth.LoginRequest;
import com.codearena.dto.auth.LoginResponse;
import com.codearena.dto.auth.RegisterRequest;
import com.codearena.entity.User;
import com.codearena.security.CustomUserDetails;
import com.codearena.service.AuthService;
import com.codearena.service.EmailService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    
    @GetMapping("/me")
    public ResponseEntity<User> currentUser(
        @AuthenticationPrincipal CustomUserDetails userDetails) {

    return ResponseEntity.ok(userDetails.getUser());
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        
        LoginResponse loginResponse = authService.register(request);
        setCookie(response, loginResponse.getToken());
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(loginResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        
        LoginResponse loginResponse = authService.login(request);
        setCookie(response, loginResponse.getToken());
        
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test-email")
public ResponseEntity<String> testEmail() {

    emailService.sendWelcomeEmail(
            "likhithadharavath2004@gmail.com",
            "Likhitha"
    );

    return ResponseEntity.ok("Test email sent successfully.");
}
    private void setCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Can be mapped to config, false for local dev HTTP
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        response.addCookie(cookie);
    }
}