package com.codearena.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codearena.dto.leaderboard.LeaderboardResponse;
import com.codearena.enums.Language;
import com.codearena.service.LeaderboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        return ResponseEntity.ok(leaderboardService.getLeaderboard());
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardResponse>> getWeeklyLeaderboard() {
        return ResponseEntity.ok(
                leaderboardService.getWeeklyLeaderboard()
        );
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<LeaderboardResponse>> getLanguageLeaderboard(
            @PathVariable Language language) {

        return ResponseEntity.ok(
                leaderboardService.getLanguageLeaderboard(language)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<LeaderboardResponse> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(leaderboardService.getForUser(userId));
    }
}