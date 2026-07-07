package com.codearena.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LoginResponse {

    private final String token;
    private final Long userId;
    private final String username;
    private final String role;
}