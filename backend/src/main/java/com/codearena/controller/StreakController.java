package com.codearena.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codearena.dto.user.StreakResponse;
import com.codearena.service.StreakService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/streak")
@RequiredArgsConstructor
public class StreakController {

    private final StreakService streakService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<StreakResponse> getUserStreak(@PathVariable Long userId) {
        StreakResponse response = streakService.getUserStreak(userId);
        return ResponseEntity.ok(response);
    }
}
